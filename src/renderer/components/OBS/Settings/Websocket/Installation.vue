<template>
    <Progress :percent="progress" />
</template>

<script>
import { mapState } from "vuex";

import Progress from "~/components/misc/Progress";

export default {
    components: {
        Progress
    },
    computed: {
        ...mapState({
            progress: state => state.websocketInstaller.progress
        })
    }
};
</script>