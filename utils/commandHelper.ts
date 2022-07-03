import { KnownBlock, Block } from '@slack/web-api';
import { program, Command, Option } from 'commander';
import * as mongoDB from 'mongodb';
import { getBlockData } from './dataHelper';

type SuccessCallback = (data: (KnownBlock | Block)[]) => Promise<void | any>;

export const commandHelper = async (db: mongoDB.Db, command: string[], onError: (err: string) => Promise<void | any>, onHelp: (help: string) => Promise<void | any>, onSuccess: SuccessCallback) => {

    program
        .name('MoneySupplyBotV2')
        .description('CLI to some economic data')
        .exitOverride()
        .addCommand(makeMoneyCommand(db, onError, onHelp, onSuccess));
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
            console.log("money ", { options: opts.type });
            try {
                const data = await getBlockData(db, opts.type);
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