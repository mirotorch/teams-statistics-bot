import * as ACData from "adaptivecards-templating";
import statisticsTemplate from "./adaptiveCards/statistics-default.json";
import { notificationApp } from "./internal/initialize";
import { NotificationTargetType } from "@microsoft/teamsfx";
import { CronJob } from 'cron';


// Schedule a cron job to send notifications every minute.
export const notificationJob = new CronJob('0 * * * * *', async () => {
    const pageSize = 100;
    let continuationToken: string | undefined = undefined;
    do {
        const pagedData = await notificationApp.notification.getPagedInstallations(
            pageSize,
            continuationToken
        );
        const installations = pagedData.data;
        continuationToken = pagedData.continuationToken;

        for (const target of installations) {
            if (target.type === NotificationTargetType.Channel) {
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
            }
        }
    } while (continuationToken);
}, null, false, 'UTC');