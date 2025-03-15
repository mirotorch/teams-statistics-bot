import * as ACData from "adaptivecards-templating";
import statisticsTemplate from "./adaptiveCards/statistics-default.json";
import { notificationApp } from "./internal/initialize";
import { NotificationTargetType } from "@microsoft/teamsfx";
import { CronJob } from 'cron';

const jobs: Record<string, CronJob> = {};


export function addNotificationJob(teamId: string) {
    jobs[teamId] = new CronJob('0 * * * * *', async () => {
        await sendStatistics(teamId);
    }, null, false, 'UTC');
    console.log(`Job added for team ${teamId}`);
    jobs[teamId].start();
}


async function sendStatistics(teamId: string) {
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
                        $root: {
                            title: "Team Statistics",
                            text: "todo text",
                            msgMost: "todo msgMost",
                            msgLeast: "todo msgLeast",
                            msgCount: "todo msgCount",
                            fileCount: "todo fileCount",
                            userCount: "todo userCount",
                        },
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