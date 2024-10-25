gmail.com:
gmail.con
gmai.com
gnail.com
gmsil.com
gamil.com
gmail.coml
hmail.com
gmail.comm
gmil.com
gmail.co
gmail.coms
gail.com
gmail.comj
gmal.com
gmaill.com
gmail.cim
gmial.com
gmail.comr
gmail.comn
gmail.comt
gmail.vom
gmail.coma
gmail.comd
gmail.comp
gmail.comw
gmaul.com
gmail.xom
gmail.comc
gmail.comh
gmail.comk
gmail.comb
gmail.comg
gmail.cpm
gmail.come
fmail.com
gmail.om
gmaol.com
gmail.cm
gmeil.com
gmail.comu

hotmail.com:
hotmail.con
hormail.com

yahoo.com:
yahoo.comm
yaho.com
yshoo.com
tahoo.com

outlook.com:
outloo.com
outlook.con

icloud.com:
cloud.com
iclod.com
iclud.com
icloud.con
ivloud.com
iclould.com
icould.com
icoud.com
iclou.com


Problem statement
Around 0.8% of users who sign up at McLuck using email+password fail to verify their email address because they have a typo in their email.

Examples: gmail.cm, yahoo.comm, iclod.com

Version 1:
- Add a matching table of known errors and the correct domain.
- Before form submission extact the domain name from entered email address and check if it is in the table.
- If yes, show a popup and ask the user "You've entered xxx@gnail.com. Did you mean xxx@gmail.com?"
- If user confirms that they made a mistake, correct the email address and then sumbit the form.

Version 2:
Instead of a hardcoded matching table, use the Levenshtein distance algorithm:
- Before form submission, extract the domain name.
- Calculate Levenshtein distance to "outlook.com", "gmail.com", "yahoo.com", ...
- If distance is 1 or 2 trigger correction popup