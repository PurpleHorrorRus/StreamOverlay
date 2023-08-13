<template>
    <div id="service-selector">
        <Service
            v-for="service of servicesList"
            :key="service.id"
            :service="service"
            @click.native="changeService(service)"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
	components: {
		Service: () => import("./Selector/Service.vue")
	},

	mixins: [CoreMixin],

	data: () => ({
		servicesList: [
			{
				id: "twitch",
				name: "Twitch"
			},
			{
				id: "trovo",
				name: "Trovo"
			}
		]
	}),

	created() {
		this.servicesList.forEach(service => {
			service.active = this.config.settings.service === service.id;
			return service;
		});
	},

	methods: {
		async changeService(service) {
			if (this.config.settings.service === service.id) {
				return false;
			}

			this.config.settings.service = service.id;
			this.config.settings.save();

			return this.$ipc.send("restart");
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