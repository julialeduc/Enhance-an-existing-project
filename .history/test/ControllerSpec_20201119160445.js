/*global app, jasmine, describe, it, beforeEach, expect */

describe('controller', function () {
	'use strict';

	var subject, model, view;

	var setUpModel = function (todos) {
		/* will find a model with given query and delegate all calls to the spy (model) to the supplied function */
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos); // pass in todos as callback
		});

		/* will return a count of all todos and delegate all calls to the spy (model) to the supplied function */
		model.getCount.and.callFake(function (callback) {

			var todoCounts = {
				/* filters out todos and returns length of active todos */
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				/* filters out todos and returns length of completed todos */
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				/* length of all unfiltered todos */
				total: todos.length
			};

			callback(todoCounts); // pass in todo counts object as callback
		});

		/* will remove a model from storage and delegate all calls to the spy (model) to the supplied function */
		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		/* will create a new todo model and delegate all calls to the spy (model) to the supplied function */
		model.create.and.callFake(function (title, callback) {
			callback();
		});

		/* will update a model by giving it an ID, data to update, and a callback to fire when the update is complete 
		and delegate all calls to the spy (model) to the supplied function */
		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	var createViewStub = function () {
		var eventRegistry = {};
		return {
			/* NOTE: When there is not a function to spy on, jasmine.createSpy can create a "bare" spy. 
			This spy acts as any other spy - tracking calls, arguments, etc. But there is no implementation behind it. 
			Spies are JavaScript objects and can be used as such. */
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};
	/* beforeEach runs some shared setup before each of the specs in the describe in which it is called. */
	beforeEach(function () {
		/* NOTE: In order to create a mock with multiple spies, use jasmine.createSpyObj and pass an array of strings. 
		It returns an object that has a property for each string that is a spy. */
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});

	it('should show entries on start-up', function () {
		// TODO: write test
		var todo = { title: 'my todo' }; // Defines a todo
		setUpModel([todo]); // Sets up the model for the todo

		subject.setView(''); // Loads and initialises the view without specifiying a route

		/* The 'toBeDefined' matcher compares against `undefined` */
		expect(todo).toBeDefined();
		/* The toHaveBeenCalledWith matcher will track all the arguments of its calls and 
		return true if the argument list matches any of the recorded calls to the spy */
		expect(view.render).toHaveBeenCalledWith('showEntries', [todo]); 
		expect(view.render).toHaveBeenCalledWith('setFilter', '');
	});

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = { title: 'my todo' }; // Defines a todo
			setUpModel([todo]); // Sets up the model for the todo

			subject.setView(''); // Loads and initialises the view without specifiying a route

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todo = { title: 'my todo' }; // Defines a todo
			setUpModel([todo]); // Sets up the model for the todo

			subject.setView('#/'); // Loads and initialises the view without specifiying a route

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show active entries', function () {
			// TODO: write test
			var todo = { title: 'my todo', completed: false }; // Defines a todo
			setUpModel([todo]); // Sets up the model for the todo

			subject.setView('#/active'); // Loads and initialises the view with the active route

			/* NOTE: jasmine.any takes a constructor or "class" name as an expected value. 
			It returns true if the constructor matches the constructor of the actual value. */
			expect(todo).toBeDefined();
			expect(todo.completed).toEqual(false);
			expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function));
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show completed entries', function () {
			// TODO: write test
			var todo = { title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('#/completed');

			expect(todo).toBeDefined();
			expect(todo.completed).toEqual(true);
			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});
	});

	it('should show the content block when todos exists', function () {
		setUpModel([{ title: 'my todo', completed: true }]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});

	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{ title: 'my todo', completed: true }]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = { id: 42, title: 'my todo', completed: true };
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	it('should highlight "All" filter by default', function () {
		// TODO: write test
		var todo = { id: 42, title: 'my todo', completed: true };
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('setFilter', '');

	});

	it('should highlight "Active" filter when switching to active view', function () {
		// TODO: write test
		var todo = { id: 42, title: 'my todo', completed: false };
		setUpModel([todo]);

		subject.setView('#/active');

		expect(view.render).toHaveBeenCalledWith('setFilter', 'active');
	});

	describe('toggle all', function () {
		it('should toggle all todos to completed', function () {
			// TODO: write test
			var todo = { id: 42, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('toggleAll', { completed: true });

			expect(model.read).toHaveBeenCalledWith({ completed: false }, jasmine.any(Function));
			expect(model.update).toHaveBeenCalledWith(42, { completed: true }, jasmine.any(Function));
		});

		it('should update the view', function () {
			// TODO: write test
			var todo = { id: 42, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('toggleAll', { completed: true });

			expect(view.render).toHaveBeenCalledWith('elementComplete', { id: 42, completed: true });
		});
	});

	describe('new todo', function () {
		it('should add a new todo to the model', function () {
			// TODO: write test
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'new todo');

			expect(model.create).toHaveBeenCalledWith('new todo', jasmine.any(Function));
		});

		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {
		it('should remove an entry from the model', function () {
			// TODO: write test
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemRemove', { id: 42 });

			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));

		});

		it('should remove an entry from the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {
		it('should remove a completed entry from the model', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({ completed: true }, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', { id: 21, completed: true });

			expect(model.update).toHaveBeenCalledWith(21, { completed: true }, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', { id: 42, completed: false });

			expect(view.render).toHaveBeenCalledWith('elementComplete', { id: 42, completed: false });
		});
	});

	describe('edit item', function () {
		it('should switch to edit mode', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', { id: 21 });

			expect(view.render).toHaveBeenCalledWith('editItem', { id: 21, title: 'my todo' });
		});

		it('should leave edit mode on done', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: 'new title' });

			expect(view.render).toHaveBeenCalledWith('editItemDone', { id: 21, title: 'new title' });
		});

		it('should persist the changes on done', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: 'new title' });

			expect(model.update).toHaveBeenCalledWith(21, { title: 'new title' }, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: '' });

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: '' });

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', { id: 21 });

			expect(view.render).toHaveBeenCalledWith('editItemDone', { id: 21, title: 'my todo' });
		});

		it('should not persist the changes on cancel', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', { id: 21 });

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
