class Controller{
    private static instance: Controller | null = null;

    static getInstance(){
        if(!this.instance) this.instance = new Controller()
        return this.instance
    }
}

export const inventoryQuery = Controller.getInstance()