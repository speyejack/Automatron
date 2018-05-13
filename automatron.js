
function State(name, transitions, final_state){
	this.name = name;
	this.transitions = transitions;
	this.final = final_state;
}

function DFA(transition_function, start_name, final_names){
	this.states = {};
	this.transitions = {};
	for (let f_state_data in transition_function){
		let f_state_name = f_state_data;
		let from_state = get_or_create_state(this.states, this.transitions, f_state_name, final_names);
		let f_state_trans = from_state.transitions;
		this.transitions[f_state_name] = f_state_trans;
		for (let i =  0; i < transition_function[f_state_name].length; i++){
			let n_state_trans = transition_function[f_state_name][i];
			let n_state_name = n_state_trans[0];
			let n_state_char = n_state_trans[1];
			let next_state = get_or_create_state(this.states, this.transitions, n_state_name, final_names);
			add_transition(from_state, n_state_char, next_state);
		}
	}
	this.start_state = this.states[start_name];
}

function get_or_create_state(states, transitions, state_name, final_names){
	if (states[state_name] === undefined){
		let trans = {}
		let state = new State(state_name, trans, final_names.indexOf(state_name) >= 0);
		states[state_name] = state;
		transitions[state_name] = trans;
	}
	return states[state_name];
}

function add_transition(from_state, on_char, to_state){
	if (from_state.transitions[on_char] === undefined){
		from_state.transitions[on_char] = [];
	}
	
	let trans_set = from_state.transitions[on_char];
	from_state.transitions[on_char].push(to_state);
}

function* process_string(dfa, string){
	let current_states = [dfa.start_state];
	let symbol;
	while (string !== "" && current_states !== []){
		yield current_states.map(state=>state.name);
		symbol = string.charAt(0);
		current_states = current_states.map(state=>state.transitions[symbol]);
		current_states = [].concat.apply([], current_states);
		string = string.substr(1);
	}
	yield current_states.map(state=>state.name);
}

function trace_automata(dfa, string){
	let gen = process_string(dfa, string);
	let trace = [];
	let cur_states;

	do{
		cur_states = gen.next().value;
		trace.push(cur_states);
	} while(cur_states);

	trace.splice(-1,1);
	let last_states = trace[trace.length-1];
	let success = last_states.reduce((prev,last_state)=>prev && dfa.states[last_state].final, true);
	return [success, trace];
}

function format_input(conf_str){
	let conf_lines = conf_str.split("\n");
	conf_lines = conf_lines.map(line=>line.trim()).map(line=>line.replace(" ", "")).filter(line=>line !== "");
	return conf_lines;
}

function parse_transition_line(dict, trans_line){
	let parts = trans_line.split(",");
	let start_state = parts[0];
	if (dict[start_state] === undefined){
		dict[start_state] = [];
	}
	dict[start_state].push(parts.splice(1));
	return dict;
}

function parse_config(conf_str){
	let conf_lines = format_input(conf_str);
	let automata_type = conf_lines[0]
	let start_state = conf_lines[1];
	let blank_char = conf_lines[2];
	let final_states = conf_lines[3].split(",");
	let transitions = conf_lines.splice(4).reduce(parse_transition_line, {});
	return [automata_type, transitions, start_state, final_states, blank_char];
}
	
