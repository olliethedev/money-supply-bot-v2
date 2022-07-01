export interface SlackData {
    token: string;
    team_id: string;
    api_app_id: string;
    event: Event;
    type: string;
    event_id: string;
    event_time: number;
    authorizations: (AuthorizationsEntity)[];
    is_ext_shared_channel: boolean;
    event_context: string;
}
interface Event {
    client_msg_id: string;
    type: string;
    text: string;
    user: string;
    ts: string;
    team: string;
    blocks?: (BlocksEntity)[] | null;
    channel: string;
    event_ts: string;
}
interface BlocksEntity {
    type: string;
    block_id: string;
    elements?: (ElementsEntity)[] | null;
}
interface ElementsEntity {
    type: string;
    elements?: (ElementsEntity1)[] | null;
}
interface ElementsEntity1 {
    type: string;
    user_id: string;
}
interface AuthorizationsEntity {
    enterprise_id?: string;
    team_id?: string;
    user_id: string;
    is_bot: boolean;
    is_enterprise_install: boolean;
}