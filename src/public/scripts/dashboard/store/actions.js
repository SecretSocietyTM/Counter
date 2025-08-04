import * as api from "../api.js";

export default {
    loadCalorieGoal(context, payload) {
        context.commit("loadCalorieGoal", payload);
    },

    loadSummaries(context, payload) {
        context.commit("loadSummaries", payload);
    },

    dateChange(context, date) {
        context.commit("dateChange", date);
    },

    loadEntry(context, entry) {
        context.commit("loadEntry", entry);
    },
    
    async addEntry(context, entry) {
        const data = await api.addToDiary(entry);

        if (data.success) {
            context.commit("addEntry", { entry: data.entry, summary: data.summary } );
        } else {
            alert(data.errmsg);
        }
    },

    async deleteEntry(context, entry_id) {
        const data = await api.deleteFromDiary(entry_id);

        if (data.success) {
            context.commit("deleteEntry", { entry: data.entry, summary: data.summary } );
        } else {
            alert(data.errmsg);
        }
    }
}