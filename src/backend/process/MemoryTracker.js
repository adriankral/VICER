define(function() {

    function MemoryTracker(mem) {
        this.mem = mem;
        this.knownLocs = {};
        this.lengths = {};
        this.clearChanges();
        this.mem.getEmitter().on("alloc", this.onAlloc.bind(this));
        this.mem.getEmitter().on("fetch", this.onFetch.bind(this));
        this.mem.getEmitter().on("assign", this.onAssign.bind(this));
        this.mem.getEmitter().on("dealloc", this.onDealloc.bind(this));
    }

    MemoryTracker.prototype.register = function register(name, loc) {
        this.knownLocs[loc] = name;
    };

    MemoryTracker.prototype.unregister = function unregister(loc) {
        this.knownLocs[loc] = undefined;
    };

    MemoryTracker.prototype.getChanges = function getChanges() {
        return Object.keys(this.changes)
            .map(function(loc) {
                return {
                    name: this.knownLocs[loc],
                    changes: this.changes[loc]
                };
            }.bind(this));
    };

    MemoryTracker.prototype.clearChanges = function clearChanges() {
        this.changes = {};
    };

    MemoryTracker.prototype.onAlloc = function onAlloc(base, length) {
        this.lengths[base] = length;
        if (length > 0) {
            this.changes[base] = [];
            this.changes[base].push({
                type: "alloc_array",
                length: length
            });
        }
    };

    MemoryTracker.prototype.onFetch = function onFetch(base, offset) {
        this.changes[base] = this.changes[base] || [];
        if (this.lengths[base] === -1) {
            this.changes[base].push({
                type: "fetch"
            });
        } else {
            this.changes[base].push({
                type: "fetch_array",
                offset: offset
            });
        }
    };

    MemoryTracker.prototype.onAssign = function onAssign(base, offset, val) {
        this.changes[base] = this.changes[base] || [];
        if (this.lengths[base] === -1) {
            this.changes[base].push({
                type: "assign",
                value: val
            });
        } else {
            this.changes[base].push({
                type: "assign_array",
                value: val,
                offset: offset
            });
        }
    };

    MemoryTracker.prototype.onDealloc = function onDealloc(base) {
        if (this.lengths[base]) {
            this.changes[base] = this.changes[base] || [];
            this.changes[base].push({
                type: this.lengths[base] === -1 ? "dealloc" : "dealloc_array"
            }); 
        }
    };

    return MemoryTracker;

});