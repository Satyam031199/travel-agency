import dayjs from "dayjs";
import {appwriteConfig, database} from "~/appwrite/client";

interface Document {
    [key: string]: any;
}

type FilterByDate = (
    items: Document[],
    key: string,
    start: string,
    end?: string,
) => number;

export const getUsersAndTripsStats = async (): Promise<DashboardStats> => {
    const d = dayjs();
    const startCurrent = d.startOf('month').toISOString();
    const startPrev = d.subtract(1, 'month').startOf('month').toISOString();
    const endPrev = d.startOf('month').subtract(1, 'day').toISOString();
    const [users, trips] = await Promise.all([
        database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId
        ),
        database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId
        )
    ]);
    const filterByDate: FilterByDate = (items, key, start, end) => {
        return items.filter((item) => {
            const date = dayjs(item[key]);
            return date.isAfter(start) && (end ? date.isBefore(end) : true);
        }).length;
    }
}