
class AppConsoleImpl {
    constructor() {}

    public log(...args) {
        console.log(...args);
    }
}

export const AppConsole = new AppConsoleImpl();