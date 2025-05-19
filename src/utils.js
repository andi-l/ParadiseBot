import {
  ITEM_ID, ITEM, SHOP_ID, TAOBAO_URL, TMALL_URL, WEIDIAN_URL, URL_1688,
  SHOP_URL, M_INTL, H5, WORLD, SHOP_M, SEARCH_QUERY
} from './config.js';

/**
 * Convert an agent site link to its original Taobao/Weidian/1688 link
 */
export function decodeLink(link) {
  // Check if it's a CSSBuy link
  if (link.includes("cssbuy.com/item")) {
    return decodeCssbuyLink(link);
  }
  // Check if it's an Oopbuy link
  else if (link.includes("oopbuy.com/product/")) {
    return decodeOopbuyLink(link);
  }
  // Check if it's a JoyaBuy link
  else if (link.includes("joyabuy.com") && link.includes("product")) {
    return decodeJoyabuyLink(link);
  }
  // Check if it's a CNFans link
  else if (link.includes("cnfans.com/product")) {
    return decodeCnfansLink(link);
  }
  // Check if it's a Hoobuy link
  else if (link.includes("hoobuy.com/product/")) {
    return decodeHoobuyLink(link);
  }
  // If it's a Taobao or Tmall link, convert it
  else if (link.includes("taobao.com") || link.includes("tmall.com")) {
    return convertTaobaoLink(link);
  }

  return "Please provide a valid agent site link (CSSBuy, CNFans, Oopbuy, JoyaBuy, Hoobuy) or Taobao/Tmall link.";
}

/**
 * Convert a CSSBuy link to its original Taobao/Weidian/1688 link
 */
function decodeCssbuyLink(link) {
  // 1. For Weidian links: item-micro-XXXXXXXXXX.html
  const weidianMatch = link.match(/item-micro-(\d+)\.html/);
  if (weidianMatch) {
    const itemId = weidianMatch[1];
    return `${WEIDIAN_URL}${itemId}`;
  }

  // 2. For 1688 links: item-1688-XXXXXXXXXX.html
  const alibabaMatch = link.match(/item-1688-(\d+)\.html/);
  if (alibabaMatch) {
    const itemId = alibabaMatch[1];
    return `${URL_1688}${itemId}.html`;
  }

  // 3. For standard Taobao links: item-XXXXXXXXXX.html
  const taobaoMatch = link.match(/item-(\d+)\.html/);
  if (taobaoMatch) {
    const itemId = taobaoMatch[1];
    return `${TAOBAO_URL}${itemId}`;
  }

  return "Could not decode the CSSBuy link. Please check the format.";
}

/**
 * Convert a CNFans link to its original Taobao/Weidian/1688 link
 */
function decodeCnfansLink(link) {
  // Extract the ID parameter
  const idMatch = link.match(/id=(\d+)/);
  if (!idMatch) {
    return "Could not find product ID in CNFans link.";
  }

  const itemId = idMatch[1];

  // Determine the platform type
  if (link.toLowerCase().includes("platform=weidian")) {
    return `${WEIDIAN_URL}${itemId}`;
  } else if (link.toLowerCase().includes("platform=taobao")) {
    return `${TAOBAO_URL}${itemId}`;
  } else if (link.toLowerCase().includes("platform=ali_1688")) {
    return `${URL_1688}${itemId}.html`;
  }

  // If platform not specified in URL, check if we can infer it
  if (itemId.length >= 10) { // Most Taobao IDs are 10+ digits
    return `${TAOBAO_URL}${itemId}`;
  }

  return "Could not determine the platform type in CNFans link.";
}

/**
 * Convert an Oopbuy link to its original Taobao/Weidian/1688 link
 */
function decodeOopbuyLink(link) {
  // Format: https://m.oopbuy.com/pages/goods/details?channelId=weidian&inviteCode=P0QTCPM0M&spuNo=7409943981
  const mobileWeidianMatch = link.match(/channelId=weidian.*spuNo=(\d+)/);
  if (mobileWeidianMatch) {
    const itemId = mobileWeidianMatch[1];
    return `${WEIDIAN_URL}${itemId}`;
  }

  // Format: https://m.oopbuy.com/pages/goods/details?channelId=1688&inviteCode=P0QTCPM0M&spuNo=846137330434
  const mobile1688Match = link.match(/channelId=1688.*spuNo=(\d+)/);
  if (mobile1688Match) {
    const itemId = mobile1688Match[1];
    return `${URL_1688}${itemId}.html`;
  }

  // Format: https://m.oopbuy.com/pages/goods/details?channelId=1&inviteCode=P0QTCPM0M&spuNo=625267101304
  const mobileTaobaoMatch = link.match(/channelId=1.*spuNo=(\d+)/);
  if (mobileTaobaoMatch) {
    const itemId = mobileTaobaoMatch[1];
    return `${TAOBAO_URL}${itemId}`;
  }

  // Format: https://oopbuy.com/product/weidian/6771436912
  const weidianMatch = link.match(/product\/weidian\/(\d+)/);
  if (weidianMatch) {
    const itemId = weidianMatch[1];
    return `${WEIDIAN_URL}${itemId}`;
  }

  // Format: https://oopbuy.com/product/1688/846137330434
  const alibabaMatch = link.match(/product\/1688\/(\d+)/);
  if (alibabaMatch) {
    const itemId = alibabaMatch[1];
    return `${URL_1688}${itemId}.html`;
  }

  // Format: https://oopbuy.com/product/1/625267101304
  const taobaoMatch = link.match(/product\/1\/(\d+)/);
  if (taobaoMatch) {
    const itemId = taobaoMatch[1];
    return `${TAOBAO_URL}${itemId}`;
  }

  return "Could not decode the Oopbuy link. Please check the format.";
}

/**
 * Convert a JoyaBuy link to its original Taobao/Weidian/1688 link
 */
function decodeJoyabuyLink(link) {
  // Extract the ID parameter
  const idMatch = link.match(/id=(\d+)/);
  if (!idMatch) {
    return "Could not find product ID in JoyaBuy link.";
  }

  const itemId = idMatch[1];

  // Determine the shop type
  if (link.includes("shop_type=weidian")) {
    return `${WEIDIAN_URL}${itemId}`;
  } else if (link.includes("shop_type=taobao")) {
    return `${TAOBAO_URL}${itemId}`;
  } else if (link.includes("shop_type=ali_1688")) {
    return `${URL_1688}${itemId}.html`;
  }

  return "Could not determine the shop type in JoyaBuy link.";
}

/**
 * Convert a Hoobuy link to its original Taobao/Weidian/1688 link
 */
function decodeHoobuyLink(link) {
  // Format: https://hoobuy.com/product/2/6771436912 (Weidian)
  const weidianMatch = link.match(/product\/2\/(\d+)/);
  if (weidianMatch) {
    const itemId = weidianMatch[1];
    return `${WEIDIAN_URL}${itemId}`;
  }

  // Format: https://hoobuy.com/product/0/846137330434 (1688)
  const alibabaMatch = link.match(/product\/0\/(\d+)/);
  if (alibabaMatch) {
    const itemId = alibabaMatch[1];
    return `${URL_1688}${itemId}.html`;
  }

  // Format: https://hoobuy.com/product/1/625267101304 (Taobao)
  const taobaoMatch = link.match(/product\/1\/(\d+)/);
  if (taobaoMatch) {
    const itemId = taobaoMatch[1];
    return `${TAOBAO_URL}${itemId}`;
  }

  return "Could not decode the Hoobuy link. Please check the format.";
}

/**
 * Convert a Taobao or Tmall link to a standardized format
 */
export function convertTaobaoLink(link) {
  if (link.includes("taobao.com")) {
    return buildTaobaoUrl(link);
  } else if (link.includes("tmall.com")) {
    return buildTmallUrl(link);
  }
  return "Invalid link. Please provide a valid Taobao or Tmall link.";
}

/**
 * Extract ID parameter from URL
 */
function extractIdFromUrl(url) {
  const idMatch = url.match(/[?&]id=(\d+)/);
  if (idMatch) {
    return idMatch[1];
  }
  return null;
}

/**
 * Build a standardized Taobao URL
 */
function buildTaobaoUrl(link) {
  // First try to extract the item ID from the URL
  const itemId = extractIdFromUrl(link);

  if (itemId) {
    // If we found an ID, return the canonical item URL
    return `${TAOBAO_URL}${itemId}`;
  }

  // If no ID found, fall back to the original logic
  if (contains(link, M_INTL) || contains(link, H5)) {
    if (link.includes('detail/detail.html')) {
      // This is a detailed mobile page, extract ID and convert
      const itemId = extractIdFromUrl(link);
      if (itemId) {
        return `${TAOBAO_URL}${itemId}`;
      }
    }
    return link.replace(M_INTL, "taobao.com").replace(H5, "taobao.com");
  } else if (contains(link, WORLD)) {
    if (contains(link, 'item')) {
      try {
        return TAOBAO_URL + getId(link, ITEM_ID);
      } catch {
        // If getId fails, try with regex
        const itemId = extractIdFromUrl(link);
        if (itemId) {
          return `${TAOBAO_URL}${itemId}`;
        }
      }
    } else {
      const intermediate = link.replace(WORLD, 'taobao.com');
      return cleanTaobaoStore(intermediate);
    }
  } else if (contains(link, SHOP_M)) {
    try {
      const shopId = getId(link, SHOP_ID);
      return SHOP_URL.replace('{}', shopId);
    } catch {
      // If getId fails, try with regex
      const shopIdMatch = link.match(/shop_id=(\d+)/);
      if (shopIdMatch) {
        return SHOP_URL.replace('{}', shopIdMatch[1]);
      }
    }
  } else {
    try {
      return TAOBAO_URL + getId(link, ITEM_ID);
    } catch {
      // If getId fails, try with regex
      const itemId = extractIdFromUrl(link);
      if (itemId) {
        return `${TAOBAO_URL}${itemId}`;
      }
    }
  }

  // If all else fails
  return link;
}

/**
 * Build a standardized Tmall URL
 */
function buildTmallUrl(link) {
  const itemId = extractIdFromUrl(link);
  if (itemId) {
    return `${TMALL_URL}${itemId}`;
  }

  try {
    return TMALL_URL + getId(link, ITEM_ID);
  } catch {
    return link;
  }
}

/**
 * Extract ID from a URL based on a match string
 */
function getId(link, match) {
  const start = link.indexOf(match) + match.length;
  let end = start;
  while (end < link.length && /\d/.test(link[end])) {
    end++;
  }
  return link.substring(start, end);
}

/**
 * Clean up a Taobao store URL
 */
function cleanTaobaoStore(link) {
  const end = link.indexOf('taobao.com/');
  if (end === -1) {
    return link;
  }
  const baseUrl = link.substring(0, end + 10);
  if (contains(link, 'search.htm')) {
    return baseUrl + SEARCH_QUERY;
  }
  return baseUrl;
}

/**
 * Convert a Yupoo link to its Zhidian-Inc.cn version
 */
export function convertYupooLink(link) {
  if (link.includes("yupoo.com")) {
    return link.replace("yupoo.com", "zhidian-inc.cn");
  }
  return "Please provide a valid Yupoo link.";
}

/**
 * Check if a string contains a substring
 */
function contains(string, query) {
  return string.includes(query);
}