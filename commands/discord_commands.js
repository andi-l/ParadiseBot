export const commands = [
  {
    name: "info",
    description: "Display information about the bot creator."
  },
  {
    name: "spreadsheet",
    description: "Get the spreadsheet link."
  },
  {
    name: "register",
    description: "Get the registration link."
  },
  {
    name: "convert",
    description: "Convert any Taobao link into its Chinese mainland desktop version.",
    options: [
      {
        name: "link",
        description: "The Taobao link to convert.",
        type: 3,
        required: true
      }
    ]
  },
  {
    name: "yupoo",
    description: "Convert a Yupoo link to its Zhidian-Inc.cn version",
    options: [
      {
        name: "link",
        description: "The Yupoo link to convert",
        type: 3,
        required: true
      }
    ]
  },
  {
    name: "decode",
    description: "Convert Agent links to the original Taobao/Weidian/1688 link.",
    options: [
      {
        name: "link",
        description: "The Agent link to decode.",
        type: 3,
        required: true
      }
    ]
  },
  {
    name: "yuan",
    description: "Convert Yuan to Euro",
    options: [
      {
        name: "amount",
        description: "Amount in Yuan to convert",
        type: 10,
        required: true
      }
    ]
  }
];