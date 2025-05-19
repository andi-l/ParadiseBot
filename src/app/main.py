import os
import re
from flask import Flask, jsonify, request
from mangum import Mangum
from asgiref.wsgi import WsgiToAsgi
from discord_interactions import verify_key_decorator

DISCORD_PUBLIC_KEY = os.environ.get("DISCORD_PUBLIC_KEY")
YUAN_TO_EURO_RATE = 0.13

app = Flask(__name__)
asgi_app = WsgiToAsgi(app)
handler = Mangum(asgi_app)

# Constants for Taobao URLs
ITEM_ID = 'id='
ITEM = 'item/'
SHOP_ID = 'shop_id='
TAOBAO_URL = 'https://item.taobao.com/item.htm?id='
TMALL_URL = 'https://detail.tmall.com/item.htm?id='
WEIDIAN_URL = 'https://weidian.com/item.html?itemID='
URL_1688 = 'https://detail.1688.com/offer/'
SHOP_URL = 'https://shop{}.taobao.com'
M_INTL = 'm.intl.taobao.com'
H5 = 'h5.m.taobao.com'
WORLD = 'world.taobao.com'
SHOP_M = 'shop.m.taobao.com'
SEARCH_QUERY = '/search.htm?search=y'


def decode_link(link):
    """Convert an agent site link to its original Taobao/Weidian/1688 link"""

    # Check if it's a CSSBuy link
    if "cssbuy.com/item" in link:
        return decode_cssbuy_link(link)

    # Check if it's an Oopbuy link
    elif "oopbuy.com/product/" in link:
        return decode_oopbuy_link(link)

    # Check if it's a JoyaBuy link
    elif "joyabuy.com" in link and "product" in link:
        return decode_joyabuy_link(link)

    # Check if it's a CNFans link
    elif "cnfans.com/product" in link:
        return decode_cnfans_link(link)

    # Check if it's a Hoobuy link
    elif "hoobuy.com/product/" in link:
        return decode_hoobuy_link(link)

    # If it's a Taobao or Tmall link, convert it
    elif "taobao.com" in link or "tmall.com" in link:
        return convert_taobao_link(link)

    return "Please provide a valid agent site link (CSSBuy, CNFans, Oopbuy, JoyaBuy, Hoobuy) or Taobao/Tmall link."


def decode_cssbuy_link(link):
    """Convert a CSSBuy link to its original Taobao/Weidian/1688 link"""

    # 1. For Weidian links: item-micro-XXXXXXXXXX.html
    weidian_match = re.search(r'item-micro-(\d+)\.html', link)
    if weidian_match:
        item_id = weidian_match.group(1)
        return f"{WEIDIAN_URL}{item_id}"

    # 2. For 1688 links: item-1688-XXXXXXXXXX.html
    alibaba_match = re.search(r'item-1688-(\d+)\.html', link)
    if alibaba_match:
        item_id = alibaba_match.group(1)
        return f"{URL_1688}{item_id}.html"

    # 3. For standard Taobao links: item-XXXXXXXXXX.html
    taobao_match = re.search(r'item-(\d+)\.html', link)
    if taobao_match:
        item_id = taobao_match.group(1)
        return f"{TAOBAO_URL}{item_id}"

    return "Could not decode the CSSBuy link. Please check the format."


def decode_cnfans_link(link):
    """Convert a CNFans link to its original Taobao/Weidian/1688 link"""

    # Extract the ID parameter
    id_match = re.search(r'id=(\d+)', link)
    if not id_match:
        return "Could not find product ID in CNFans link."

    item_id = id_match.group(1)

    # Determine the platform type
    if "platform=weidian" in link.lower():
        return f"{WEIDIAN_URL}{item_id}"
    elif "platform=taobao" in link.lower():
        return f"{TAOBAO_URL}{item_id}"
    elif "platform=ali_1688" in link.lower():
        return f"{URL_1688}{item_id}.html"

    # If platform not specified in URL, check if we can infer it
    # This is mostly for debugging as most CNFans URLs should have the platform parameter
    if len(item_id) >= 10:  # Most Taobao IDs are 10+ digits
        return f"{TAOBAO_URL}{item_id}"

    return "Could not determine the platform type in CNFans link."


def decode_oopbuy_link(link):
    """Convert an Oopbuy link to its original Taobao/Weidian/1688 link"""

    # Format: https://m.oopbuy.com/pages/goods/details?channelId=weidian&inviteCode=P0QTCPM0M&spuNo=7409943981
    mobile_weidian_match = re.search(r'channelId=weidian.*spuNo=(\d+)', link)
    if mobile_weidian_match:
        item_id = mobile_weidian_match.group(1)
        return f"{WEIDIAN_URL}{item_id}"

    # Format: https://m.oopbuy.com/pages/goods/details?channelId=1688&inviteCode=P0QTCPM0M&spuNo=846137330434
    mobile_1688_match = re.search(r'channelId=1688.*spuNo=(\d+)', link)
    if mobile_1688_match:
        item_id = mobile_1688_match.group(1)
        return f"{URL_1688}{item_id}.html"

    # Format: https://m.oopbuy.com/pages/goods/details?channelId=1&inviteCode=P0QTCPM0M&spuNo=625267101304
    mobile_taobao_match = re.search(r'channelId=1.*spuNo=(\d+)', link)
    if mobile_taobao_match:
        item_id = mobile_taobao_match.group(1)
        return f"{TAOBAO_URL}{item_id}"

    # Existing desktop Oopbuy link formats
    # Format: https://oopbuy.com/product/weidian/6771436912
    weidian_match = re.search(r'product/weidian/(\d+)', link)
    if weidian_match:
        item_id = weidian_match.group(1)
        return f"{WEIDIAN_URL}{item_id}"

    # Format: https://oopbuy.com/product/1688/846137330434
    alibaba_match = re.search(r'product/1688/(\d+)', link)
    if alibaba_match:
        item_id = alibaba_match.group(1)
        return f"{URL_1688}{item_id}.html"

    # Format: https://oopbuy.com/product/1/625267101304
    taobao_match = re.search(r'product/1/(\d+)', link)
    if taobao_match:
        item_id = taobao_match.group(1)
        return f"{TAOBAO_URL}{item_id}"

    return "Could not decode the Oopbuy link. Please check the format."


def decode_joyabuy_link(link):
    """Convert a JoyaBuy link to its original Taobao/Weidian/1688 link"""

    # Extract the ID parameter
    id_match = re.search(r'id=(\d+)', link)
    if not id_match:
        return "Could not find product ID in JoyaBuy link."

    item_id = id_match.group(1)

    # Determine the shop type
    if "shop_type=weidian" in link:
        return f"{WEIDIAN_URL}{item_id}"
    elif "shop_type=taobao" in link:
        return f"{TAOBAO_URL}{item_id}"
    elif "shop_type=ali_1688" in link:
        return f"{URL_1688}{item_id}.html"

    return "Could not determine the shop type in JoyaBuy link."


def decode_hoobuy_link(link):
    """Convert a Hoobuy link to its original Taobao/Weidian/1688 link"""

    # Format: https://hoobuy.com/product/2/6771436912 (Weidian)
    weidian_match = re.search(r'product/2/(\d+)', link)
    if weidian_match:
        item_id = weidian_match.group(1)
        return f"{WEIDIAN_URL}{item_id}"

    # Format: https://hoobuy.com/product/0/846137330434 (1688)
    alibaba_match = re.search(r'product/0/(\d+)', link)
    if alibaba_match:
        item_id = alibaba_match.group(1)
        return f"{URL_1688}{item_id}.html"

    # Format: https://hoobuy.com/product/1/625267101304 (Taobao)
    taobao_match = re.search(r'product/1/(\d+)', link)
    if taobao_match:
        item_id = taobao_match.group(1)
        return f"{TAOBAO_URL}{item_id}"

    return "Could not decode the Hoobuy link. Please check the format."


def convert_taobao_link(link):
    if "taobao.com" in link:
        return build_taobao_url(link)
    elif "tmall.com" in link:
        return build_tmall_url(link)
    return "Invalid link. Please provide a valid Taobao or Tmall link."


def extract_id_from_url(url):
    # Use regex to extract the ID parameter from the URL
    id_match = re.search(r'[?&]id=(\d+)', url)
    if id_match:
        return id_match.group(1)
    return None


def build_taobao_url(link):
    # First try to extract the item ID from the URL
    item_id = extract_id_from_url(link)

    if item_id:
        # If we found an ID, return the canonical item URL
        return f"{TAOBAO_URL}{item_id}"

    # If no ID found, fall back to the original logic
    if contains(link, M_INTL) or contains(link, H5):
        if 'detail/detail.html' in link:
            # This is a detailed mobile page, extract ID and convert
            item_id = extract_id_from_url(link)
            if item_id:
                return f"{TAOBAO_URL}{item_id}"
        return link.replace(M_INTL, "taobao.com").replace(H5, "taobao.com")
    elif contains(link, WORLD):
        if contains(link, 'item'):
            try:
                return TAOBAO_URL + get_id(link, ITEM_ID)
            except:
                # If get_id fails, try with regex
                item_id = extract_id_from_url(link)
                if item_id:
                    return f"{TAOBAO_URL}{item_id}"
        else:
            intermediate = link.replace(WORLD, 'taobao.com')
            return clean_taobao_store(intermediate)
    elif contains(link, SHOP_M):
        try:
            return SHOP_URL.format(get_id(link, SHOP_ID))
        except:
            # If get_id fails, try with regex
            shop_id_match = re.search(r'shop_id=(\d+)', link)
            if shop_id_match:
                return SHOP_URL.format(shop_id_match.group(1))
    else:
        try:
            return TAOBAO_URL + get_id(link, ITEM_ID)
        except:
            # If get_id fails, try with regex
            item_id = extract_id_from_url(link)
            if item_id:
                return f"{TAOBAO_URL}{item_id}"

    # If all else fails
    return link


def build_tmall_url(link):
    item_id = extract_id_from_url(link)
    if item_id:
        return f"{TMALL_URL}{item_id}"

    try:
        return TMALL_URL + get_id(link, ITEM_ID)
    except:
        return link


def get_id(link, match):
    start = link.index(match) + len(match)
    end = start
    while end < len(link) and link[end].isdigit():
        end += 1
    return link[start:end]


def clean_taobao_store(link):
    end = link.find('taobao.com/')
    if end == -1:
        return link
    end += 10
    if contains(link, 'search.htm'):
        return link[:end] + SEARCH_QUERY
    return link[:end]

def convert_yupoo_link(link):
    """Convert a Yupoo link to its Zhidian-Inc.cn version"""
    if "yupoo.com" in link:
        return link.replace("yupoo.com", "zhidian-inc.cn")
    return "Please provide a valid Yupoo link."

def contains(string, query):
    return query in string


@app.route("/", methods=["POST"])
async def interactions():
    print(f"👉 Request: {request.json}")
    raw_request = request.json
    return interact(raw_request)


@verify_key_decorator(DISCORD_PUBLIC_KEY)
def interact(raw_request):
    if raw_request["type"] == 1:  # PING
        response_data = {"type": 1}  # PONG
    else:
        data = raw_request["data"]
        command_name = data["name"]

        if command_name == "info":
            message_content = "This bot was created by <@637803920340549633>"
            ephemeral = False
        elif command_name == "spreadsheet":
            message_content = "<https://tinyurl.com/repparadise>"
            ephemeral = False
        elif command_name == "register":
            message_content = "Register here <https://www.cssbuy.com/paradise>"
            ephemeral = False
        elif command_name == "convert":
            taobao_link = data["options"][0]["value"]
            message_content = convert_taobao_link(taobao_link)
            ephemeral = True  # Nur für den ausführenden Nutzer sichtbar
        elif command_name == "decode":
            agent_link = data["options"][0]["value"]
            message_content = decode_link(agent_link)
            ephemeral = True  # Nur für den ausführenden Nutzer sichtbar
        elif command_name == "yuan":
            yuan_amount = float(data["options"][0]["value"])
            euro_amount = yuan_amount * YUAN_TO_EURO_RATE
            message_content = f"¥{yuan_amount:.2f} = €{euro_amount:.2f}"
            ephemeral = True  # Nur für den ausführenden Nutzer sichtbar
        elif command_name == "yupoo":
            yupoo_link = data["options"][0]["value"]
            message_content = convert_yupoo_link(yupoo_link)
            ephemeral = True  # Nur für den ausführenden Nutzer sichtbar
        else:
            message_content = "Command not recognized."
            ephemeral = False

        response_data = {
            "type": 4,
            "data": {
                "content": message_content,
                "flags": 64 if ephemeral else 0  # Flag 64 bedeutet ephemeral
            },
        }

    return jsonify(response_data)


if __name__ == "__main__":
    app.run(debug=True)