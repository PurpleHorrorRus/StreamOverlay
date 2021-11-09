<template>
    <webview
        ref="webview"
        class="webview"
        :src="src"
        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0"
        webpreferences="allowRunningInsecureContent"
        disablewebsecurity
    />
</template>

<script>
export default {
    props: {
        src: {
            type: String,
            required: true
        }
    },
    mounted() {
        this.$refs.webview.addEventListener("dom-ready", () => this.$refs.webview?.setAudioMuted(true));
    }
};
</script>