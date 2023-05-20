import { Subject } from "rxjs";
export default class Queue<T> {
	private items: T[];
	private subject: Subject<T>;
	constructor() {
		this.items = [];
		this.subject = new Subject<T>();
	}

	// Add new item to queue
	enqueue(item: T): void {
		this.items.push(item);
		this.subject.next(item);
	}

	// Remove item from queue
	dequeue(): T | undefined {
		return this.items.shift();
	}

	// Check if queue is empty
	isEmpty(): boolean {
		return this.items.length === 0;
	}

	// Get size of queue
	size(): number {
		return this.items.length;
	}

	// Get first item in queue without removing it
	peek(): T | undefined {
		return this.items[0];
	}

	// Clear queue
	clear(): void {
		this.items = [];
	}
	observe(): Subject<T> {
		return this.subject;
	}
}
