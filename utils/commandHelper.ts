import { program } from 'commander';
import * as mongoDB from 'mongodb';
import { getBlockData } from './dataHelper';

type SuccessCallback = (data: any) => Promise<void | any>;

export const commandHelper = async (db: mongoDB.Db, command: string[], onError: (err: string) => void, onHelp: (help: string) => void, onSuccess: SuccessCallback) => {

    program
        .name('MoneySupplyBotV2')
        .description('CLI to some economic data')
        .version('0.2.1')
        .configureOutput({
            writeOut: (str) => {
                process.stdout.write(`[OUT] ${ str }`);
                onHelp(str);
            },
            writeErr: (str) => {
                process.stdout.write(`[ERR] ${ str }`);
                onError(str);
            },
            outputError: (str, write) => write(str)
        })
        .exitOverride()
        .command('money <string>')
        .description('Get Canada`s money supply')
        .action(async (str) => {
            try {
                const data = await getBlockData(db, str === "M2" || str === "M3" ? str : "M1");
                return onSuccess(data);
            } catch (error) {
                onError((error as any)?.message);
            }

        });

    try {
        return program.parseAsync(command);

    } catch (error) {
        console.log({ error });
    }
}