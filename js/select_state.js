class SelectState {
	/** @type {[number, number][]} */
	_selections = [[-1, 0]];
	/**
	 * Returns a new select state.
	 * @param {[number, number][]} selections - One or more selections, ordered from old to new.
	 */
	constructor(...selections) {
		if (selections.length >= 1) {
			this._selections = selections;
		}
	}
	/**
	 * Returns an object as a select state.
	 * @param {object} obj - the object to classify.
	 */
	static classify(obj = {}) {
		let instance = new SelectState();
		for (const key in instance) {
			if (Object.hasOwn(instance, key) && Object.hasOwn(obj, key)) {
				instance[key] = obj[key];
			}
		}
		return instance;
	}
	/**
	 * Returns (a refrence to) the current selection.
	 */
	get() {
		return this._selections[this._selections.length - 1];
	}
	/**
	 * Returns (a refrence to) the previous stacked selection.
	 */
	getPrev() {
		return this._selections.length >= 2 ? this._selections[this._selections.length - 2] : null;
	}
	/**
	 * Replaces the current selection.
	 * @param {number} type - The new selection type.
	 * @param {number} index - The new selection index. Defaults to `0`.
	 */
	set(type, index = 0) {
		this._selections[this._selections.length - 1] = [type, index];
	}
	/**
	 * Removes the current selection, then replaces the previous stacked selection that becomes the current one.
	 * @param {number} type - The new selection type.
	 * @param {number} index - The new selection index. Defaults to `0`.
	 */
	setBackTo(type, index = 0) {
		this.pop();
		this.set(type, index);
	}
	/**
	 * Adds a new selection on top of the previous one.
	 * @param {number} type - The new selection type.
	 * @param {number} index - The new selection index. Defaults to `0`.
	 */
	push(type, index = 0) {
		this._selections.push([type, index]);
	}
	/**
	 * Removes the current selection and returns it. The previous stacked selection becomes the current one.
	 */
	pop() {
		const selection = this._selections.pop();
		if (selection === undefined) {
			throw RangeError("There must be at least one selection.");
		}
		return selection;
	}
	/**
	 * Returns a boolean indicating whether the current selection belongs to any of the specified selection types.
	 * @param {...number} selectionTypes - Any number of values from `S` or `SS`.
	 */
	is(...selectionTypes) {
		return selectionTypes.includes(this.get()[0]);
	}
	/**
	 * Returns a boolean indicating whether the previous stacked selection belongs to any of the specified selection types.
	 * @param {...number} selectionTypes - Any number of values from `S` or `SS`.
	 */
	prevIs(...selectionTypes) {
		const prev = this.getPrev();
		return prev && selectionTypes.includes(prev[0]);
	}
}
