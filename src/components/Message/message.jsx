// import { message } from "antd"

// const success = (mes = 'Success') => {
//     message.success(mes)
// };

// const error = (mes = 'Error') => {
//     message.error(mes)
// };

// const warning = (mes = 'Warning') => {
//     message.warning(mes)
// }

// export { success, error, warning}

import { message } from "antd";

const MessageService = (() => {
    let instance = null;

    const success = (mes = 'Success') => {
        message.success(mes);
    };

    const error = (mes = 'Error') => {
        message.error(mes);
    };

    const warning = (mes = 'Warning') => {
        message.warning(mes);
    };

    const getInstance = () => {
        if (!instance) {
            instance = {
                success,
                error,
                warning
            };
        }
        return instance;
    };

    return {
        getInstance
    };
})();

export default MessageService;
