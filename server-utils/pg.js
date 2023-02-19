import { POSTGRES_CONNECTION_STRING } from "@/constants/config";
import { Client } from "pg";

const pg = new Client({
    connectionString: POSTGRES_CONNECTION_STRING
});

pg.connect();

export default {
    ...pg,
    execute: async (query, ...args) => {
        const { rows = [] } = await pg.query(query, ...args);
        return rows;
    }
};