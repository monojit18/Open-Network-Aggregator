export const driverJobMock = {
  context: {
    transaction_id: 'b21a4b80-96f8-4b23-bb84-9bf70d788c08',
    message_id: '448248e4-802e-489a-89a6-654127864afb',
    version: '1.1.0',
    domain: 'driver:work-opportunities',
    action: 'on_search',
    timestamp: '2024-10-01T06:48:28.408Z',
    bap_uri: 'https://job-seeker-dev.gcpwkshpdev.com/bap',
    bap_id: 'job-seeker-dev.gcpwkshpdev.com',
    ttl: 'P1M',
    bpp_uri: 'https://onest-jobs.skillsetu.co/api/v1/onest_ondc/bpp',
    bpp_id: 'onest-jobs.skillsetu.co',
  },
  message: {
    catalog: {
      descriptor: {
        name: 'Driver jobs search list',
      },
      providers: [
        {
          id: 'O4C71SSL',
          descriptor: {
            name: 'APNA',
            short_desc:
              'Find your next hire on apna. apna is a leading job portal trusted by 7 lakh+ recruiters to post jobs & hire candidates. Experience hassle free hiring with us, post a job in just 5 minutes and get leads fast.',
            images: [
              {
                url: 'https://www.idfcfirstbank.com/content/dam/idfcfirstbank/images/offers/business-banking-offers/beyond-banking-offer/apna-logo-1-crop.png',
                size_type: 'sm',
              },
            ],
          },
          fulfillments: [
            {
              id: 'F3',
              type: 'ONSITE',
            },
            {
              id: 'F2',
              type: 'HYBRID',
            },
          ],
          locations: [
            {
              id: 'L1',
              city: {
                name: 'Hyderabad',
                code: 'std:040',
              },
              state: {
                name: 'Telangana',
                code: 'TS',
              },
            },
            {
              id: 'L2',
              city: {
                name: 'Coimbatore',
                code: 'std:0422',
              },
              state: {
                name: 'Tamil Nadu',
                code: 'TN',
              },
            },
            {
              id: 'L3',
              city: {
                name: 'Delhi',
                code: 'std:011',
              },
              state: {
                name: 'Delhi',
                code: 'DL',
              },
            },
          ],
          items: [
            {
              id: 'YZTE94DY',
              descriptor: {
                name: 'Personal car driver',
                long_desc:
                  'This is a significant role and requires multi-tasking along with time management and load ability including warehouse layout also loading and unloading of the goods received inbound and outbound.',
                images: [
                  {
                    url: 'https://www.idfcfirstbank.com/content/dam/idfcfirstbank/images/offers/business-banking-offers/beyond-banking-offer/apna-logo-1-crop.png',
                  },
                ],
              },

              quantity: {
                available: {
                  count: 5,
                },
              },
              location_ids: ['L1', 'L2', 'L3'],
              fulfillment_ids: ['F3'],
              tags: [
                {
                  display: true,
                  descriptor: {
                    code: 'job-requirements',
                    name: 'Job Requirements',
                  },
                  list: [
                    {
                      descriptor: {
                        code: 'req-experience',
                        name: 'Required Work Experience in Years',
                      },
                      value: '5',
                      display: true,
                    },
                  ],
                },
                {
                  display: true,
                  descriptor: {
                    code: 'listing-details',
                    name: 'Listing Details',
                  },
                  list: [
                    {
                      descriptor: {
                        code: 'industry-type',
                        name: 'Industry Type',
                      },
                      value: 'General',
                      display: true,
                    },
                    {
                      descriptor: {
                        code: 'department',
                        name: 'Department',
                      },
                      value: 'Goods & Services',
                      display: true,
                    },
                    {
                      descriptor: {
                        code: 'employment-type',
                        name: 'Employment Type',
                      },
                      value: 'Full Time',
                      display: true,
                    },
                    {
                      descriptor: {
                        code: 'job-role',
                        name: 'Job Role',
                      },
                      value: null,
                      display: true,
                    },
                  ],
                },
                {
                  display: true,
                  descriptor: {
                    code: 'salary-info',
                    name: 'Salary Information',
                  },
                  list: [
                    {
                      descriptor: {
                        code: 'gross-min',
                        name: 'Minimum Gross Pay',
                      },
                      value: '10,000',
                      display: true,
                    },
                    {
                      descriptor: {
                        code: 'gross-max',
                        name: 'Maximum Gross Pay',
                      },
                      value: '12,000',
                      display: true,
                    },
                  ],
                },
              ],
            },
            {
              id: 'YZTE94DY',
              descriptor: {
                name: 'Driver-cum-Office Helper for Company office',
                long_desc:
                  'Salary with OT, Bata, Medical policy for self and family, personal insurance, Bonus. Family accommodation provided after 06-months',
                images: [
                  {
                    url: 'https://www.idfcfirstbank.com/content/dam/idfcfirstbank/images/offers/business-banking-offers/beyond-banking-offer/apna-logo-1-crop.png',
                  },
                ],
              },

              quantity: {
                available: {
                  count: 2,
                },
              },
              location_ids: ['L1', 'L2', 'L3'],
              fulfillment_ids: ['F3'],
              tags: [
                {
                  display: true,
                  descriptor: {
                    code: 'job-requirements',
                    name: 'Job Requirements',
                  },
                  list: [
                    {
                      descriptor: {
                        code: 'req-experience',
                        name: 'Required Work Experience in Years',
                      },
                      value: '4',
                      display: true,
                    },
                  ],
                },
                {
                  display: true,
                  descriptor: {
                    code: 'listing-details',
                    name: 'Listing Details',
                  },
                  list: [
                    {
                      descriptor: {
                        code: 'industry-type',
                        name: 'Industry Type',
                      },
                      value: 'Personal',
                      display: true,
                    },
                    {
                      descriptor: {
                        code: 'department',
                        name: 'Department',
                      },
                      value: 'Goods & Services',
                      display: true,
                    },
                    {
                      descriptor: {
                        code: 'employment-type',
                        name: 'Employment Type',
                      },
                      value: 'Full Time',
                      display: true,
                    },
                    {
                      descriptor: {
                        code: 'job-role',
                        name: 'Job Role',
                      },
                      value: 'Driving cum helper',
                      display: true,
                    },
                  ],
                },
                {
                  display: true,
                  descriptor: {
                    code: 'salary-info',
                    name: 'Salary Information',
                  },
                  list: [
                    {
                      descriptor: {
                        code: 'gross-min',
                        name: 'Minimum Gross Pay',
                      },
                      value: '22,000.00',
                      display: true,
                    },
                    {
                      descriptor: {
                        code: 'gross-max',
                        name: 'Maximum Gross Pay',
                      },
                      value: '25,000.00',
                      display: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};
export const ondcSellMock = {
  context: {
    domain: 'ONDC:RET12',
    country: 'IND',
    city: 'std:080',
    action: 'on_search',
    core_version: '1.2.0',
    bap_id: 'ondc.paytm.com',
    bap_uri: 'https://ondc.paytm.com/retail',
    bpp_uri: 'https://ondc.sellerapp.in/bpp/u',
    transaction_id: '04d94e8b-6878-43e5-884a-b0ad1a4a4ba9',
    message_id: '1724059839934',
    timestamp: '2024-08-19T09:30:58.773Z',
    bpp_id: 'ondc.sellerapp.in',
  },
  message: {
    catalog: {
      descriptor: {
        name: 'SellerApp',
        category: 'Sell',
        symbol: 'https://cdn.sellerapp.com/img/sellerapp-amazon-logo.svg',
        short_desc: 'ONDC MSN',
        long_desc: 'ONDC marketplace for sellers',
        images: ['https://cdn.sellerapp.com/img/sellerapp-amazon-logo.svg'],
        tags: [
          {
            code: 'bpp_terms',
            list: [
              {
                code: 'np_type',
                value: 'ONDC-FPO',
              },
              {
                code: 'B2B',
                value: 'ONDC-B2B',
              },
            ],
          },
        ],
      },
      providers: [
        {
          id: 'slrp-1458171',
          time: {
            label: 'enable',
            timestamp: '2024-08-17T14:31:47.037Z',
          },
          categories: {
            code: 'bpp_terms',
            list: [
              {
                code: 'B2B',
                value: 'ONDC-B2B',
              },
            ],
          },
          fulfillments: [
            {
              id: '1',
              type: 'Delivery',
              contact: {
                phone: '9739613968',
                email: 'care@cinnamoncloset.in',
              },
            },
          ],
          descriptor: {
            name: 'SellerApp',
            symbol: 'https://cdn.sellerapp.in/Logos/Cinnamon_Closet.png',
            // short_desc: 'National Seeds Corporation Limited',
            // long_desc:
            //   'National Seeds Corporation Limited National Seeds Corporation Ltd. (NSC) is a Schedule ‘B’-Miniratna Category-I company wholly owned by Government of India under the administrative control of Department of Agriculture Cooperation & Farmer’s Welfare, Ministry of Agriculture and Farmers Welfare.',
            images: ['https://cdn.sellerapp.in/Logos/Cinnamon_Closet.png'],
          },
          ttl: 'P2D',

          items: [
            {
              id: 'ec010e9cf5889c87',
              time: {
                label: 'enable',
                timestamp: '2024-08-17T14:31:47.034Z',
              },
              parent_item_id: '5a6e9d3da7ac8ed5',
              descriptor: {
                name: 'Ninjacart',
                symbol:
                  'https://pbs.twimg.com/profile_images/1714990888567406593/3dT8ZcAb_400x400.jpg',
                short_desc:
                  'Generating new engines of growth for agri commodity traders',
                // long_desc:
                //   'Short duration, blast resistant rice variety suitable for both kharif and rabi seasons.',
              },

              category_id: 'Shirts',
              fulfillment_id: '1',
              location_id: 'tki-1000',
              '@ondc/org/returnable': false,
              '@ondc/org/cancellable': false,
              '@ondc/org/return_window': 'P0D',
              '@ondc/org/seller_pickup_return': false,
              '@ondc/org/time_to_ship': 'P5D',
              '@ondc/org/available_on_cod': false,
              '@ondc/org/contact_details_consumer_care':
                'Keerthanaa,care@cinnamoncloset.in,8970522704',
              '@ondc/org/statutory_reqs_packaged_commodities': {
                manufacturer_or_packer_name: 'Cinnamon Closet',
                manufacturer_or_packer_address:
                  '#5A \u0026 6, Ground Floor, Bhanu Nursing Home Rd, NGR Layout, Bommanahalli, Bengaluru, Karnataka 560068',
                common_or_generic_name_of_commodity: 'Shirts',
                month_year_of_manufacture_packing_import: '12-Jul',
              },
            },

            {
              id: 'ec010e9cf5889c87',
              time: {
                label: 'enable',
                timestamp: '2024-08-17T14:31:47.034Z',
              },
              parent_item_id: '5a6e9d3da7ac8ed5',
              descriptor: {
                name: 'Dehaat',
                symbol:
                  'https://www.smartstateindia.com/wp-content/uploads/2021/10/DeHaat-Logo.jpg',
                short_desc:
                  'DeHaat connects farmers to suppliers and buyers on a single platform. Online marketplace providing all the agricultural products and services to farmers.',
                // long_desc:
                //   'Short duration, blast resistant rice variety suitable for both kharif and rabi seasons.',
              },

              category_id: 'Shirts',
              fulfillment_id: '1',
              location_id: 'tki-1000',
              '@ondc/org/returnable': false,
              '@ondc/org/cancellable': false,
              '@ondc/org/return_window': 'P0D',
              '@ondc/org/seller_pickup_return': false,
              '@ondc/org/time_to_ship': 'P5D',
              '@ondc/org/available_on_cod': false,
              '@ondc/org/contact_details_consumer_care':
                'Keerthanaa,care@cinnamoncloset.in,8970522704',
              '@ondc/org/statutory_reqs_packaged_commodities': {
                manufacturer_or_packer_name: 'Cinnamon Closet',
                manufacturer_or_packer_address:
                  '#5A \u0026 6, Ground Floor, Bhanu Nursing Home Rd, NGR Layout, Bommanahalli, Bengaluru, Karnataka 560068',
                common_or_generic_name_of_commodity: 'Shirts',
                month_year_of_manufacture_packing_import: '12-Jul',
              },
            },
          ],
        },
      ],
      'bpp/fulfillments': [
        {
          id: '1',
          type: 'Delivery',
        },
      ],
    },
  },
};
export const mandiMock = {
  active: '1',
  catalog_uuid: '6141ea17-a69d-4713-b600-0a43c8fd9a6c',
  count: 100,
  created: 1695098583,
  created_date: '2023-09-19T06:43:03Z',
  desc: 'Variety-wise Daily Market Prices Data of Commodity',
  external_ws: 0,
  external_ws_url: '',
  field: [
    {
      id: 'State',
      name: 'State',
      type: 'keyword',
    },
    {
      id: 'District',
      name: 'District',
      type: 'keyword',
    },
    {
      id: 'Market',
      name: 'Market',
      type: 'keyword',
    },
    {
      id: 'Commodity',
      name: 'Commodity',
      type: 'keyword',
    },
    {
      id: 'Variety',
      name: 'Variety',
      type: 'keyword',
    },
    {
      id: 'Grade',
      name: 'Grade',
      type: 'keyword',
    },
    {
      id: 'Arrival_Date',
      name: 'Arrival_Date',
      type: 'date',
    },
    {
      id: 'Min_Price',
      name: 'Min_Price',
      type: 'keyword',
    },
    {
      id: 'Max_Price',
      name: 'Max_Price',
      type: 'keyword',
    },
    {
      id: 'Modal_Price',
      name: 'Modal_Price',
      type: 'keyword',
    },
    {
      id: 'Commodity_Code',
      name: 'Commodity_Code',
      type: 'keyword',
    },
  ],
  field_dependent: {
    'State.keyword': {
      child: 'District.keyword',
      parent: 'State.keyword',
    },
  },
  field_exposed: [
    {
      id: 'State.keyword',
      mandatory: true,
      name: 'State',
      type: 'keyword',
    },
    {
      id: 'District.keyword',
      mandatory: true,
      name: 'District',
      type: 'keyword',
    },
    {
      id: 'Commodity.keyword',
      name: 'Commodity',
      type: 'keyword',
    },
    {
      format: 'dd-MM-yyyy',
      id: 'Arrival_Date',
      name: 'Arrival Date',
      type: 'date',
    },
  ],
  index_name: '35985678-0d79-46b4-9ed6-6f13308a1d24',
  limit: '100',
  message: 'Resource lists',
  offset: '0',
  order: [
    {
      id: 'Market.keyword',
      name: 'Market',
    },
    {
      id: 'Commodity.keyword',
      name: 'Commodity',
    },
  ],
  org: [
    'Ministry of Agriculture and Farmers Welfare',
    'Department of Agriculture and Farmers Welfare',
    'Directorate of Marketing and Inspection (DMI)',
  ],
  org_type: 'Central',
  records: [
    {
      Arrival_Date: '21/01/2006',
      Commodity: 'Rice',
      Commodity_Code: '3',
      District: 'Bangalore',
      Grade: 'FAQ',
      Market: 'Bangalore',
      Max_Price: '1350',
      Min_Price: '800',
      Modal_Price: '1075',
      State: 'Karnataka',
      Variety: 'Dappa',
    },
    {
      Arrival_Date: '15/07/2006',
      Commodity: 'Rice',
      Commodity_Code: '3',
      District: 'Bangalore',
      Grade: 'FAQ',
      Market: 'Channapatana',
      Max_Price: '1100',
      Min_Price: '900',
      Modal_Price: '1000',
      State: 'Karnataka',
      Variety: 'Medium',
    },
    // {
    //   Arrival_Date: '25/01/2006',
    //   Commodity: 'Rice',
    //   Commodity_Code: '3',
    //   District: 'Bangalore',
    //   Grade: 'FAQ',
    //   Market: 'Bangalore',
    //   Max_Price: '1000',
    //   Min_Price: '700',
    //   Modal_Price: '875',
    //   State: 'Karnataka',
    //   Variety: 'Dappa',
    // },
    {
      Arrival_Date: '27/01/2006',
      Commodity: 'Rice',
      Commodity_Code: '3',
      District: 'Bangalore',
      Grade: 'FAQ',
      Market: 'Ramanagara',
      Max_Price: '1350',
      Min_Price: '825',
      Modal_Price: '1175',
      State: 'Karnataka',
      Variety: 'Dappa',
    },
    {
      Arrival_Date: '27/01/2006',
      Commodity: 'Rice',
      Commodity_Code: '3',
      District: 'Bangalore',
      Grade: 'FAQ',
      Market: 'Doddaballa Pur',
      Max_Price: '1350',
      Min_Price: '800',
      Modal_Price: '1075',
      State: 'Karnataka',
      Variety: 'Dappa',
    },
  ],
  sector: ['Agriculture', 'Agricultural Marketing'],
  source: 'data.gov.in',
  status: 'ok',
  target_bucket: {
    field: '35985678-0d79-46b4-9ed6-6f13308a1d24',
    index: 'agmarknet',
    type: '6141ea17-a69d-4713-b600-0a43c8fd9a6c',
  },
  title: 'Variety-wise Daily Market Prices Data of Commodity',
  total: 12614,
  updated: 1727743519,
  updated_date: '2024-10-01T00:45:19Z',
  version: '2.2.0',
  visualizable: '0',
};
export interface OndcModel {
  context: Context;
  message: Message;
}

export interface Context {
  domain: string;
  country: string;
  city: string;
  action: string;
  core_version: string;
  bap_id: string;
  bap_uri: string;
  bpp_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  bpp_id: string;
}

export interface Message {
  catalog: Catalog;
}

export interface Catalog {
  descriptor: Descriptor;
  providers: Provider[];
  'bpp/fulfillments': Fulfillment2[];
}

export interface Descriptor {
  name: string;
  category: string;
  symbol: string;
  short_desc: string;
  long_desc: string;
  images: string[];
  tags: Tag[];
}

export interface Tag {
  code: string;
  list: List[];
}

export interface List {
  code: string;
  value: string;
}

export interface Provider {
  id: string;
  time: Time;
  categories: Category;
  fulfillments: Fulfillment[];
  descriptor: Descriptor2;
  ttl: string;
  items: Item[];
}

export interface Time {
  label: string;
  timestamp: string;
}

export interface Category {
  list: List2[];
}

export interface List2 {
  code: string;
  value: string;
}

export interface Fulfillment {
  id: string;
  type: string;
  contact: Contact;
}

export interface Contact {
  phone: string;
  email: string;
}

export interface Descriptor2 {
  name: string;
  symbol: string;
  short_desc: string;
  long_desc: string;
  images: string[];
}

export interface Item {
  id: string;
  time: Time2;
  parent_item_id: string;
  descriptor: Descriptor3;
  quantity: Quantity;
  price: Price;
  category_id: string;
  fulfillment_id: string;
  location_id: string;
  '@ondc/org/returnable': boolean;
  '@ondc/org/cancellable': boolean;
  '@ondc/org/return_window': string;
  '@ondc/org/seller_pickup_return': boolean;
  '@ondc/org/time_to_ship': string;
  '@ondc/org/available_on_cod': boolean;
  '@ondc/org/contact_details_consumer_care': string;
  '@ondc/org/statutory_reqs_packaged_commodities': OndcOrgStatutoryReqsPackagedCommodities;
}

export interface Time2 {
  label: string;
  timestamp: string;
}

export interface Descriptor3 {
  name: string;
  symbol: string;
  short_desc: string;
  long_desc: string;
}

export interface Quantity {
  unitized: Unitized;
  available: Available;
  maximum: Maximum;
}

export interface Unitized {
  measure: Measure;
}

export interface Measure {
  unit: string;
  value: string;
}

export interface Available {
  count: string;
}

export interface Maximum {
  count: string;
}

export interface Price {
  currency: string;
  value: string;
  maximum_value: string;
}

export interface OndcOrgStatutoryReqsPackagedCommodities {
  manufacturer_or_packer_name: string;
  manufacturer_or_packer_address: string;
  common_or_generic_name_of_commodity: string;
  month_year_of_manufacture_packing_import: string;
}

export interface Fulfillment2 {
  id: string;
  type: string;
}

export const socketOnVideo = {
  context: {
    domain: 'integrator:video',
    transaction_id: '6a988e4c-9811-49d0-a45f-5dbaa344f628',
    message_id: 'e6c0dacb-88b1-440b-95e5-88308ee75eb5',
  },
  message: {
    network: { name: 'VIDEO', video: { query: 'show some youtube videos' } },
    provider: {
      regionCode: 'SG',
      videos: [
        {
          videoId: '_CmjnKOJHIo',
          publishedAt: '2022-09-30T16:37:01Z',
          channelId: 'UCU5pjAzVVE68WbU9KbAB6QA',
          title: 'How To Watch YouTube Videos While Using Other Apps',
          description:
            "Let's watch your favorite YouTube videos and channels while browsing other apps at the same time. Double bonus! If this video ...",
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/_CmjnKOJHIo/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/_CmjnKOJHIo/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/_CmjnKOJHIo/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'Trevor Nace',
          publishTime: '2022-09-30T16:37:01Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/_CmjnKOJHIo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
        {
          videoId: 'XqrJp6TlUhs',
          publishedAt: '2022-12-26T13:02:15Z',
          channelId: 'UCvpfclapgcuJo0M_x65pfRw',
          title: 'The Hidden YouTube Setting!',
          description:
            'The YouTube app on Android and iPhone has a hidden setting that all of us should enable. Hit like if you did not know this ...',
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/XqrJp6TlUhs/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/XqrJp6TlUhs/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/XqrJp6TlUhs/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'Beebom',
          publishTime: '2022-12-26T13:02:15Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/XqrJp6TlUhs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
        {
          videoId: 'Ue3uQFA6mJY',
          publishedAt: '2021-10-30T05:50:00Z',
          channelId: 'UCymK_3BWUcoYVVf5D_GmACQ',
          title: 'The traitor 😭 #shorts by Tsuriki Show',
          description:
            'Thank you for watching. Subscribe to Tsuriki Show! More about us in Instagram https://instagram.com/twiceofnice And a huge ...',
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/Ue3uQFA6mJY/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/Ue3uQFA6mJY/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/Ue3uQFA6mJY/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'Tsuriki Show',
          publishTime: '2021-10-30T05:50:00Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/Ue3uQFA6mJY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
        {
          videoId: 'a2vJLW0ZkX0',
          publishedAt: '2022-08-09T08:30:01Z',
          channelId: 'UCWaOde99oeUVoXbIj3SNu9g',
          title:
            'Sagawa1gou funny video 😂😂😂 | SAGAWA Best Shorts 2022 #shorts',
          description: '',
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/a2vJLW0ZkX0/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/a2vJLW0ZkX0/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/a2vJLW0ZkX0/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'Sagawa /さがわ',
          publishTime: '2022-08-09T08:30:01Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/a2vJLW0ZkX0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
        {
          videoId: '8B-vTnySQig',
          publishedAt: '2022-01-17T21:49:09Z',
          channelId: 'UCIsPTUntUX2jzGuRXgkBi6A',
          title:
            'How to Download YouTube Video to Mobile | Download ANY Video You Want!',
          description:
            "In today's video, I show you how to download YouTube video to mobile. This method works for any YouTube video and is a very ...",
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/8B-vTnySQig/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/8B-vTnySQig/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/8B-vTnySQig/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'JMG ENTERPRISES  ',
          publishTime: '2022-01-17T21:49:09Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/8B-vTnySQig" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
        {
          videoId: '2NVyhD5taJI',
          publishedAt: '2023-04-20T21:59:33Z',
          channelId: 'UCcI9wgP_3FST6irs1O7d0ag',
          title: 'Packing School Lunch *CANDY CEREAL* Bella✨#shorts',
          description: '',
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/2NVyhD5taJI/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/2NVyhD5taJI/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/2NVyhD5taJI/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'Unique Daily',
          publishTime: '2023-04-20T21:59:33Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/2NVyhD5taJI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
        {
          videoId: 'pfSgsaSBwAU',
          publishedAt: '2019-07-05T15:09:21Z',
          channelId: 'UCei6wyubYC1I1FwZ54LZFiA',
          title: 'Best Apps For YouTube Videos and YouTubers',
          description:
            'These are the best apps for YouTube videos. They will help you edit videos on your phone, make thumbnails, keep an eye on ...',
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/pfSgsaSBwAU/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/pfSgsaSBwAU/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/pfSgsaSBwAU/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'Nick Nimmin',
          publishTime: '2019-07-05T15:09:21Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/pfSgsaSBwAU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
        {
          videoId: 'TKYUGxn1lgE',
          publishedAt: '2024-09-06T13:06:12Z',
          channelId: 'UCZTsvX8ckNW4vR7FswP_phw',
          title:
            '#YouTube# viral# short #videos#🌟🌚💚 #trending #@MrBeast#এমআর# বেস্ট# ট্রেন্ডিং# #ভিডিও#youtube',
          description:
            'viral youtube video, viral youtube video ideas, viral youtube video subliminal, viral youtube video ideas 2024, viral youtube video ...',
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/TKYUGxn1lgE/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/TKYUGxn1lgE/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/TKYUGxn1lgE/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: ' AB_KALAM_COMEDY',
          publishTime: '2024-09-06T13:06:12Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/TKYUGxn1lgE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
        {
          videoId: '4XSU17gdL_4',
          publishedAt: '2022-06-17T18:50:53Z',
          channelId: 'UCFXZBGS7J0IDINQc8xtMqCg',
          title:
            'Did you pass ✅ or fail ❌this challenge? Subscribe to get another chance ;)',
          description: '',
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/4XSU17gdL_4/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/4XSU17gdL_4/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/4XSU17gdL_4/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'scottsreality',
          publishTime: '2022-06-17T18:50:53Z',
          player: {
            embedHtml:
              '<iframe width="480" height="270" src="//www.youtube.com/embed/4XSU17gdL_4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
      ],
      playLists: [
        {
          playlistId: 'PLcFJuPgqvEijxMg4QAg81JVq94TUzoaRH',
          publishedAt: '2023-08-25T04:41:24Z',
          channelId: 'UCJHXySmGPMp_rumvsXalZUA',
          title: 'the good youtube videos',
          description: 'the good and the interesting side of youtube.',
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/YzfUj-m2I6I/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/YzfUj-m2I6I/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/YzfUj-m2I6I/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'Poji',
          publishTime: '2023-08-25T04:41:24Z',
          player: {
            embedHtml:
              '<iframe width="640" height="360" src="http://www.youtube.com/embed/videoseries?list=PLcFJuPgqvEijxMg4QAg81JVq94TUzoaRH" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
          },
        },
      ],
    },
  },
};
