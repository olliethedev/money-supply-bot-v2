export interface MonetaryData {
    chart_data: ((ChartDataEntityEntity)[] )[]
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
    raw_data: ((number)[] )[] ;
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
  