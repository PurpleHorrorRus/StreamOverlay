<template>
    <div class="modal-content database">
        <LeftSubmenu />
        <div v-if="users.length" id="database-users">
            <ModalTitle :text="'Пользователи'" />
            <button @click="deleteDubs" v-text="'Удалить дубликаты'" />
            <button @click="checkFollowers" v-text="'Перепроверить подписки'" />
            <table>
                <tr>
                    <th v-text="'ID'" />
                    <th v-text="'Name'" />
                    <th v-text="'Level'" />
                    <th v-text="'Coins'" />
                </tr>
                <tr
                    v-for="user of users"
                    :key="user.id"
                >
                    <td align="center" v-text="user.id || 'Не определено'" />
                    <td align="center" v-text="user.name" />
                    <td align="center" width="100" v-text="user.level" />
                    <td align="center" v-text="user.coins" />
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import LeftSubmenu from "~/components/settings/database/LeftSubmenu";
import ModalTitle from "~/components/ModalTitle";

export default {
    layout: "modal",
    components: { 
        ModalTitle,
        LeftSubmenu,  
    },
    data: () => ({ 
        users: [] 
    }),
    computed: {
        ...mapGetters({
            connection: "database/getConnection",
            user: "twitch/getUser",
            helix: "twitch/getHelix",
            client: "twitch/getClient",
            settings: "settings/getSettings"
        })
    },
    async mounted () {
        this.users = await this.connection.collection
            .find().sort({ level: -1, coins: -1 }).toArray();
    },
    methods: {
        async deleteDubs () {
            const databaseUsers = await this.connection.collection.find().toArray();
            const ids = databaseUsers.map(u => Number(u.id));
            
            for (let i = 0; i < ids.length; i++) {
                for (let j = i + 1; j < ids.length; j++) {
                    if (ids[i] === ids[j]) {
                        this.connection.deleteUser(ids[i]);
                    }
                }
            }
        },
        async checkFollowers () {
            let databaseUsers = await this.connection.collection.find().toArray();
            databaseUsers = databaseUsers.map(u => ({
                id: u.id,
                name: u.name
            }));

            const followers = await this.helix.getAllFollowers(this.user.id);
            const users = followers.map(f => ({
                id: f.from_id,
                name: f.from_name
            }));

            const databaseIds = databaseUsers.map(u => Number(u.id));
            const usersIds = users.map(u => Number(u.id));

            const databaseCollision = databaseIds.filter(id => !~usersIds.indexOf(id));
            const usersCollision = usersIds.filter(id => !~databaseIds.indexOf(id));

            const databaseCollisionUsers = databaseCollision.map(id => ({
                id,
                name: databaseUsers[databaseIds.indexOf(id)].name
            })).filter(u => u.id !== 66312032);

            databaseCollisionUsers.forEach(u => {
                this.connection.deleteUser(u.id);
                this.client.ban(u.name, "побег из культа");
            });

            const collisionUsers = usersCollision.map(id => ({
                id,
                name: users[usersIds.indexOf(id)].name
            }));

            collisionUsers.forEach(this.connection.addUser);
        }
    }
};
</script>

<style>
.modal-content.database {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 50px 1fr;
    grid-template-areas: "LeftSubmenu Content";

    height: 600px;
}

#database-users {
    grid-area: Content;
    overflow: auto;
}
</style>