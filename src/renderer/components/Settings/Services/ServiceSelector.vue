<template>
    <div id="service-selector">
        <Service
            v-for="service of servicesList"
            :key="service.id"
            :service="service"
            @click.self.native="changeService(service)"
        />
    </div>
</template>

<script>
import { ipcRenderer } from "electron";

import TwitchImage from "~/assets/images/twitch.png";
import TrovoImage from "~/assets/images/trovo.png";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Service: () => import("~/components/Settings/Services/Selector/Service")
    },

    mixins: [CoreMixin],

    data: () => ({
        servicesList: [
            {
                id: "twitch",
                name: "Twitch",
                image: TwitchImage
            },
            {
                id: "trovo",
                name: "Trovo",
                image: TrovoImage
            }
        ]
    }),

    created() {
        this.servicesList.forEach(service => {
            service.active = this.settings.service === service.id;
            return service;
        });
    },

    methods: {
        async changeService(service) {
            if (this.settings.service === service.id) {
                return;
            }

            this.settings.service = service.id;
            this.save();

            ipcRenderer.send("restart");
        }
    }
};
</script>

<style lang="scss">
.service-selector {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
}
</style>