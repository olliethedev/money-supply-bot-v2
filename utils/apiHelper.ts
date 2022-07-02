import fetch from 'node-fetch';
import FormData from 'form-data';

export interface MonetaryData {
    chart_data: ((ChartDataEntityEntity)[])[]
    chart_quarterly_date_format: string;
    chart_url: string;
    chart_url_params: string;
    embed_host: string;
    embed_linkback_name: string;
    embed_linkback_url: string;
    end_date?: null;
    quotes?: null;
    start_date: string;
}
interface ChartDataEntityEntity {
    annotation_line_types?: (null)[] | null;
    axis_type: string;
    can_annualize: string;
    currency_code: string;
    estimates_start_date?: null;
    event_types?: (null)[] | null;
    format: string;
    frequency: string;
    last_value: number;
    line_format: LineFormat;
    long_label: string;
    object_calc?: null;
    object_id: string;
    object_type: string;
    raw_data: ((number)[])[];
    securitylist_name?: null;
    short_label: string;
    source: string;
    type: string;
}
interface LineFormat {
    color: string;
    weight: string;
    area_chart: boolean;
}

export const getMoneySupply = async (moneySupplyType: 'M1' | 'M2' | 'M3') => {
    const moneyResp = await fetch(`${ process.env.DATA_API }?chartType=interactive&dateSelection=range&format=real&partner=basic_2000&scaleType=linear&splitType=single&zoom=2&redesign=true&maxPoints=689&securities=id%3AI%3AC${ moneySupplyType }${ moneySupplyType === "M3" ? "MS" : "MSSM" }%2Cinclude%3Atrue%2C%2C`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "sec-gpc": "1",
            "upgrade-insecure-requests": "1",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
    });
    return (moneyResp.json() as Promise<MonetaryData>);
}

export interface HousingToken {
    status: boolean;
    data: Data;
    error: Error;
}
interface Data {
    message: string;
    access_token: string;
}
interface Error {
    code: number;
    message: string;
}


export const getHousingLoginToken = async () => {
    var formdata = new FormData();

    return fetch(`${ process.env.HOUSING_API }/init/accesstoken/new`, {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    })
        .then(response => response.json() as Promise<HousingToken>);
}

export interface HousingLogin {
    message: string;
    user: User;
    registered: boolean;
}
export interface User {
    user_id: number;
    name: string;
    login_name: string;
    phonenumber?: null;
    email: string;
    lang: string;
    province: string;
    stopreview: string;
    fub_id_people?: null;
    fub_assigned_user_id?: null;
    premium_active: number;
    premium_expire_date?: null;
    create_date: string;
    watch_notification_method?: (null)[] | null;
    show_onboard: number;
    watch: number;
}


export const registerHousingToken = (token: string, email: string, password: string) => {

    var formdata = new FormData();
    formdata.append("email", email);
    formdata.append("pass", password);

    return fetch(`${ process.env.HOUSING_API }/auth/user/signin`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ token }`,
        },
        body: formdata,
        redirect: 'follow'
    })
        .then(response => response.json() as Promise<HousingLogin>);
}

export interface HousingFilters {
    status: boolean;
    data: FilterData;
    error: {
        code: number;
        message: string;
    };
}
export interface FilterData {
    message: string;
    public: number;
    last_update: string;
    municipality_filter?: (MunicipalityFilterEntity)[] | null;
    community_filter?: (CommunityFilterEntity)[] | null;
    housetype_filter?: (HousetypeFilterEntity)[] | null;
    current: any;
    filter_active: any;
    if_watched: boolean;
    watch_types?: (null)[] | null;
    contact_message: string;
    community_has_agent: number;
    meta: Meta;
}
export interface MunicipalityFilterEntity {
    title: string;
    list?: (ListEntity)[] | null;
}
export interface ListEntity {
    id: number;
    Name: string;
    name: string;
}
export interface CommunityFilterEntity {
    id: string | number;
    name: string;
}
export interface HousetypeFilterEntity {
    id: string;
    name: string;
}

export interface Meta {
    title: string;
    description: string;
    image: string;
}


export const getHousingFilters = async () => {
    const token = await getHousingLoginToken();
    const login = await registerHousingToken(token.data.access_token, process.env.HOUSING_EMAIL as string, process.env.HOUSING_PASS as string);
    return fetch(`${ process.env.HOUSING_API }/stats/trend/summary`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${ token.data.access_token }`,
        },
        redirect: 'follow'
    })
        .then(response => response.json() as Promise<HousingFilters>);
}

export interface Filter {
    municipality?: string,
    community?: string,
    house_type?: string,
    province?: string,
    period_num?: number
}

export interface HousingTrends {
    status: boolean;
    data: TrendsData;
    error: {
        code: number;
        message: string;
    };
    chart_cached: boolean;
    chart_house_type_cached: boolean;
}
export interface TrendsData {
    message: string;
    chart?: (ChartEntity)[] | null;
    chart_axis: ChartAxis;
    chart_house_type?: (ChartHouseTypeEntity)[] | null;
    chart_sold_price?: (ChartSoldPriceEntity)[] | null;
}
export interface ChartEntity {
    period: string;
    sold_count: string;
    price_sold: string;
    list_days: string;
    list_count: string;
    list_active: string;
    absorption_rate: number;
    rent_ratio: string;
    rent_count: string;
    price_rent: string;
    rent_listing_count: string;
}
export interface ChartAxis {
    list_count_max: number;
    list_count_min: number;
    price_sold_max: number;
    price_sold_min: number;
    price_rent_max: number;
    list_days_max: number;
    list_days_min: number;
    absorption_rate_max: number;
    absorption_rate_min: number;
    list_active_max: number;
    list_active_min: number;
    sold_count_max: number;
    sold_count_min: number;
}
export interface ChartHouseTypeEntity {
    house_type: string;
    listing_count: number;
    listing_percent: number;
    house_type_name: string;
}
export interface ChartSoldPriceEntity {
    price100k: number;
    sold_count: number;
}


export const getHousingTrends = async (filter: Filter = {
    municipality: "1001",
    community: "all",
    house_type: "all",
    province: "ON",
    period_num: 120
}) => {
    const token = await getHousingLoginToken();
    const login = await registerHousingToken(token.data.access_token, process.env.HOUSING_EMAIL as string, process.env.HOUSING_PASS as string);
    return fetch(`${ process.env.HOUSING_API }/stats/trend/chart`, {
        method: "POST",
        headers: {
            authorization: `Bearer ${ token.data.access_token }`,
            "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
            ...filter,
            ign: "",
            lang: "en_US",
        })
    })
        .then(response => response.json() as Promise<HousingTrends>);
}