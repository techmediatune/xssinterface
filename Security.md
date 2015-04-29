# Warning #

This library might contain severe security holes. Peer review is very welcome!

# Cross Domain Communication #

Sending messages works through setting a cookie under the destination domain. The listener only accepts messages that contain a certain security token. Callers receive the token through a cookie that the listener places under the caller domain.

Unknown messages are simply discarded. The library makes sure that only methods added through addCallback() are visible.

# Risks #

Methods exposed by addCallback() might be called by an evil third party (For example if a caller has a security hole). The methods should never call eval() on their arguments.

# DOS #

An attacker may be able to perform a DOS attack against messagePassing by passing bogus messages. These will be ignored because the attacker does not know about the security token, but they will still be processed. A workaround is to use a random channel id that the attacker cannot guess. The attacker will still be able to create a lot of bad cookies. But those have a limited lifetime of only 2 seconds.