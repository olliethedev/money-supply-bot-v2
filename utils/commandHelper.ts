import { KnownBlock, Block } from '@slack/web-api';
import { program, Command, Option } from 'commander';
import * as mongoDB from 'mongodb';
import moment from 'moment';
import HousingHelper from './HousingHelper';
import MoneyHelper from './MoneyHelper';

type SuccessCallback = (data: (KnownBlock | Block)[]) => Promise<void | any>;

export const commandHelper = async (db: mongoDB.Db, command: string[], onError: (err: string) => Promise<void | any>, onHelp: (help: string) => Promise<void | any>, onSuccess: SuccessCallback) => {

    program
        .name('MoneySupplyBotV2')
        .description('CLI to some economic data')
        .exitOverride()
        .addCommand(makeMoneyCommand(db, onError, onHelp, onSuccess))
        .addCommand(makeHousingCommand(db, onError, onHelp, onSuccess));
    try {
        const result = await program.parseAsync(command);
        program.commands = [];
        return result;

    } catch (error) {
        console.log(JSON.stringify(error));
        await onError(program.helpInformation());
        program.commands = [];
    }
}

const makeMoneyCommand = (db: mongoDB.Db, onError: (err: string) => void, onHelp: (help: string) => void, onSuccess: SuccessCallback) => {
    return new Command('money')
        .description('Get Canada`s money supply')
        .addOption(new Option('-t, --type <string>', "Type of data to fetch").choices(['M1', 'M2', 'M3']).default("M1"))
        .action(async (opts) => {
            console.log("money ", { options: opts });
            try {
                const moneyHelper = new MoneyHelper();
                const data = await moneyHelper.getBlockData(db, opts.type);
                const image = await moneyHelper.getImageBlock();
                return onSuccess([data, image]);
            } catch (error) {
                onError((error as any)?.message);
            }
        })
        .configureOutput({
            writeOut: onHelp,
            writeErr: onError,
        })
        .exitOverride()
}

const makeHousingCommand = (db: mongoDB.Db, onError: (err: string) => void, onHelp: (help: string) => void, onSuccess: SuccessCallback) => {
    return new Command('housing')
        .description('Get Canada`s housing supply')
        .addOption(new Option('-mu, --municipality <string>', "Name of municipality to fetch"))
        // .addOption(new Option('-c, --community <string>', "Code of community to fetch").default("all"))
        .addOption(new Option('-t, --type <string>', "Type of housing to fetch. (all)All, (D)Detached, (S)Semi-detached, (A)Freehold Townhouse, (T)Condo Townhouse, (C)Condo Apt, (L)Link").choices(["all", "D", "S", "A", "T", "C", "L"]).default("all"))
        .addOption(new Option('-m, --month <string>', "Month to fetch").choices([...moment.months("MMMM")]).default(moment().month(moment().month()).format("MMMM")))
        .addOption(new Option('-y, --year <string>', "Year to fetch. Ex: 2022").default(moment().year(moment().year()).format("YYYY")))
        .action(async (opts) => {
            console.log("housing ", { options: opts });
            try {
                const data = await new HousingHelper().getBlockData(db,
                    {
                        filter: {
                            period_num: 120,
                            province: "ON",
                            municipality: opts.municipality ?? "1001",
                            community: opts.community ?? "all",
                            house_type: opts.type.length > 0 ? opts.type : `${ opts.type }.` //add period to type for single letter types
                        },
                        month: moment().month(opts.month).format("MM"),
                        year: opts.year
                    });
                return onSuccess([data]);
            } catch (error) {
                onError((error as any)?.message);
            }

        })
        .configureOutput({
            writeOut: onHelp,
            writeErr: onError,
        })
        .exitOverride()
}