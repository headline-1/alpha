# 0.3.16

* [FIX] FS: Access instead of exists

# 0.3.14

* [FIX] FS: makeDirs creates correct relative directories

# 0.3.13

* [FIX] Missing RevertStack export

# 0.3.12

* [NEW] RevertStack implementation. Whenever your command fails (by throwing an error), you will be able to revert all reversible things

# 0.3.11

* [FIX] "remove" should remove directories...

# 0.3.10

* [FIX] Input stream redirection for child processes
* [FIX] Exported `io-ts` types
* [FIX] Fixed docs generation 

# 0.2.0

* Added logger
* Small cleanup

# 0.1.6

Reworked action mechanisms taken from Lemmy & Native Butler.
Now, one configuration file is required to import commands. Commands can be installed as separate packages. One tool can wrap multiple others and integrate them into a single flow.
