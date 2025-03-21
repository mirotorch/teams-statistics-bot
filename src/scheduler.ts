import * as ACData from "adaptivecards-templating";
import statisticsTemplate from "./adaptiveCards/statistics-default.json";
import { notificationApp } from "./internal/initialize";
import { NotificationTargetType } from "@microsoft/teamsfx";
import { CronJob } from 'cron';
import { initStatistics, CardInfo, getCardInfo } from "./statistics";

const jobs: Record<string, CronJob> = {};


export async function addNotificationJob(teamId: string) {
    await initStatistics(teamId);
    jobs[teamId] = new CronJob('0 * * * * *', async () => {
        const info = await getCardInfo(teamId);
        await sendCard(teamId, info);
    }, null, false, 'UTC');
    console.log(`Job added for team ${teamId}`);
    jobs[teamId].start();
}

async function sendCard(teamId: string, info: CardInfo) {
    const pageSize = 100;
    let continuationToken: string | undefined = undefined;
    do {
        const pagedData = await notificationApp.notification.getPagedInstallations(
            pageSize,
            continuationToken
        );
        const installations = pagedData.data;
        continuationToken = pagedData.continuationToken;

        let sent: Boolean = false;
        for (const target of installations) {
            if (target.type === NotificationTargetType.Channel && target.conversationReference?.conversation?.id === teamId) {
                await target.sendAdaptiveCard(
                    new ACData.Template(statisticsTemplate).expand({
                        $root: info,
                    })
                );
                sent = true;
                break;
            }
        }
        if (!sent) {
            console.log(`No channel found for team ${teamId}`);
            jobs[teamId].stop();
            return;
        }
    } while (continuationToken);
    console.log(`Statistics sent for team ${teamId}`);
}