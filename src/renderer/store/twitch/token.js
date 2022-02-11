import Fastify from "fastify";

const config = {
    PORT: 3000
};

export default {
    namespaced: true,
    state: () => ({
        fastify: null
    }),
    actions: {
        START_SERVER: ({ dispatch, state }) => {
            state.fastify = Fastify();

            state.fastify.get("/token", () => {
                setTimeout(() => dispatch("CLOSE_SERVER"), 10 * 1000);

                // eslint-disable-next-line max-len
                return "Ваш токен находится в ссылке. Скопируйте ссылку полностью и вставьте его в соответствующее поле.";
            });

            state.fastify.listen(config.PORT);
        },
        CLOSE_SERVER: ({ state }) => {
            state.fastify?.close();
            state.fastify = null;
        }
    }
};