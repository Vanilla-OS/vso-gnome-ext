# Vanilla OS On-going Update Check
This GNOME Extension checks if the system is undergoing an update and allows 
the user to request a cancelation of the update process.

In Vanilla OS, the update process is handled by ABRoot, each update consists of
multiple stages, and the process can be canceled until the 6th stage is reached.
This extension checks if ABRoot allows the user to cancel the update process and
lets the user request a cancelation by adding a lock file to /tmp.
