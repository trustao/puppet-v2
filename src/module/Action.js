import { sendAction, setPromiseHook, setDownloadHook } from './Junctor/Render';
import { Task } from "./newTask";
let uid = 0;
export var ActionType;
(function (ActionType) {
    ActionType["Click"] = "CLICK";
    ActionType["Input"] = "INPUT";
    ActionType["SetFile"] = "SET_FILE";
    ActionType["Select"] = "SELECT";
    ActionType["GetAttr"] = "GET_ATTR";
    ActionType["GetText"] = "GET_TEXT";
    ActionType["GetValue"] = "GET_VALUE";
    ActionType["Download"] = "DOWNLOAD";
    ActionType["Blur"] = "BLUR";
    ActionType["Check"] = "CHECK";
    ActionType["CheckExist"] = "EXIST";
    ActionType["HasAttr"] = "HAS_ATTR";
    ActionType["Wait"] = "WAIT";
    ActionType["Navigate"] = "NAVIGATE";
    ActionType["Promise"] = "PROMISE";
})(ActionType || (ActionType = {}));
export const action = async (actionType, payload) => {
    console.log(actionType);
    switch (actionType) {
        case ActionType.Wait:
            return await Task.waitMoment(payload.state && payload.state.time)();
        case ActionType.Promise:
            return await promiseAction(payload);
        case ActionType.Download:
            const res = await downLoadAction(payload);
            console.log('download', res);
            return res[0];
            break;
        case ActionType.Blur:
        case ActionType.Click:
        case ActionType.GetText:
        case ActionType.Input:
        case ActionType.Select:
        case ActionType.Check:
        case ActionType.HasAttr:
        case ActionType.CheckExist:
        case ActionType.GetAttr:
        case ActionType.SetFile:
        default:
            return await baseAction({
                uuid: createKey(actionType),
                type: actionType,
                ...payload
            });
    }
};
async function promiseAction(payload) {
    if (!payload.promiseFn)
        return Promise.reject();
    try {
        const state = await payload.promiseFn(payload);
        return { uuid: '', status: 'SUCCESS', state };
    }
    catch (err) {
        return { uuid: '', status: 'FAIL', state: err };
    }
}
function clickAction({ selector, inFrame }) {
    return baseAction({
        uuid: createKey(ActionType.Click),
        type: ActionType.Click,
        selector,
        inFrame
    });
}
function downLoadAction(payload) {
    return Promise.all([
        createDownloadAction(),
        clickAction(payload)
    ]);
}
function createDownloadAction() {
    return new Promise((resolve, reject) => {
        setDownloadHook(createKey(ActionType.Download), resolve, reject);
    });
}
function baseAction(payload) {
    return new Promise((resolve, reject) => {
        sendAction(payload);
        setPromiseHook(payload.uuid, resolve, reject);
    });
}
function createKey(actionType) {
    // 32进制时间戳-uid-4随机串-ActionType
    return `${Date.now().toString(32)}-${uid++}-${Math.random().toString(32).slice(2, 6)}-${actionType}`;
}
//# sourceMappingURL=Action.js.map