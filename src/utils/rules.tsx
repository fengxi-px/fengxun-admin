import moment from "moment";

export const validateInput = ({ }) => ({
    validator(_: any, value: any) {
        if (!value || value.trim().length !== 0) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Input cannot be only spaces!'));
    },
});

export const disabledDate = (current: any) => {
    // Can not select days after today
    return current && current > moment().endOf('day');
}