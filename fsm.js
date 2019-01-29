
class FSM {

    constructor() {
        this.state = "start";
    }

    responds_to(action) {
        let fsm = this;
        return fsm.states()[fsm.state][action] !== undefined;
    }

    take_action(action) {
        let fsm = this;
        // TODO: Check if state exists
        return fsm.states()[fsm.state][action]();
    }

    update_state(new_state) {
        let fsm = this;        
        this.state = new_state;
        return;
    }

    process_epsilons() {
        let fsm = this;  
        // TODO: Don't do this idenfinitely
        console.log("processing epsilons for ", fsm.state);      
        if ( fsm.responds_to('epsilon') ) {
            return fsm.dispatch('epsilon');
        }
    }

    dispatch(action) {
        let fsm = this;     
        console.log("dispatching: " + fsm.state + ", action: " + action)   
        return fsm.take_action(action)
          .then(new_state => fsm.update_state(new_state))
          .then(() => fsm.process_epsilons());
    }

}

module.exports = FSM;