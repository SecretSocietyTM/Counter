import * as api from "../api.js";

export default {
    dateChange(context, date) {
        context.commit("dateChange", date);
    },

    async loadCalorieGoal(context, payload) {
        const data = await api.getCalorieGoal();

        data.success ?
            context.commit("loadCalorieGoal", data.goal) :
            alert(data.errmsg);
    },

    async loadSummaries(context, date) {
        const data = await api.getWeeklySummary(date);

        data.success ?
            context.commit("loadSummaries", data.summaries) :
            alert(data.errmsg);
    },

    async loadEntries(context, date) {
        const data = await api.getDiary(date);

        data.success ?
            data.entries.forEach(entry => context.commit("loadEntry", entry)) :
            alert(data.errmsg);
    },

    async addEntry(context, entry) {
        const data = await api.addToDiary(entry);

        data.success ?
            context.commit("addEntry", { entry: data.entry, summary: data.summary }) :
            alert(data.errmsg);
    },

    async deleteEntry(context, entry_id) {
        const data = await api.deleteFromDiary(entry_id);

        data.success ?
            context.commit("deleteEntry", { entry: data.entry, summary: data.summary }) :
            alert(data.errmsg);
    }
};