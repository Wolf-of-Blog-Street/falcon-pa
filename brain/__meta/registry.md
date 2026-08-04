# brain registry — AUTHORED TRUTH (not gitignored). Edit via `brain register`.
# [entities] name = tenses · [verbs] name = past|drop [; inverse=v] [; eg=..] · [aliases] name = target ; kind=slug|verb · [profiles] entity.field = type [; required] [; enum=a|b] [; currency=CODE] [; query=..] [; lint=..] [; budget=N] · [weak] name
# format: 3

[entities]
person = card
me = card
standing-order = card
attempt = record
preference = card
working-memory = card
company = card
place = card
asset = card
system = card
project = card
skill = card
context = card
reference = card
tool = card
note = card
memory = card, record
lesson = card
conversation = record
filing = record
action = future, record
decision = future, record
obligation = future, record
event = future, card, record

[verbs]
with = was_with
attends = was_there
happening_at = happened_at
discusses = discussed
needs = used
delegated = was_delegated
advances = advanced ; inverse=contains
contains = contained ; inverse=advances
waiting_on = drop
depends_on = drop ; inverse=do_before
do_before = drop ; inverse=depends_on
filed_by = filed_by
serves = served ; inverse=served_by
served_by = drop ; inverse=serves
part_of = drop ; inverse=has_part
has_part = drop ; inverse=part_of
in_context = was_in_context ; inverse=includes ; eg=wolf-tracker → in_context → wolf-network
includes = drop ; inverse=in_context
stated_by = 
issued_by = 
reports_to = 
bound_by = 

[aliases]

[profiles]
person.name = text
person.aka = list
person.relationship = multi ; enum=client|staff|partner|family|contact|provider|self
person.tier = select ; enum=T0|T1|T2
person.email = list
person.phone = list
person.city = text
person.country = text
person.role = text
person.birthday = date
me.important_to = list ; query=what is important to the owner? ; budget=8
me.likes = list ; query=what does the owner like? ; budget=12
me.dislikes = list ; query=what does the owner dislike? ; budget=12
me.working_style = list ; query=how does the owner like to work? ; budget=10
company.name = text
company.aka = list
company.relationship = multi ; enum=own|client|partner|provider|authority
company.legal_name = text
company.jurisdiction = text
company.tax_id = text
company.formed = date
company.registered_agent = ref ; entities=person|company
place.name = text
place.address = text
place.city = text
place.country = text
place.category = select ; enum=restaurant|office|home|school|venue
place.phone = text
asset.name = text
asset.category = select ; enum=domain|equipment|vehicle|ip|account|property|website
asset.acquired = date
asset.cost = number
asset.currency = text
asset.registrar = ref ; entities=company
asset.expires = date
asset.renews = bool
asset.url = text
asset.platform = text
asset.hosting = ref ; entities=company|system
system.name = text
system.url = text
system.category = select ; enum=platform|service
project.name = text
project.started = date
skill.name = text
skill.cadence = text
skill.last_verified = date
skill.system = ref ; entities=system
context.name = text
context.mission = text
reference.name = text
reference.source = text
reference.bookmarks = list
reference.file = text
reference.url = text
tool.name = text
tool.command = text
tool.path = text
tool.data = text
tool.url = text
conversation.channel = select ; enum=call|email|chat|in-person
filing.period = text
filing.cycle = date
decision.outcome = text
obligation.cadence = text
obligation.period = text
obligation.payee = ref ; entities=person|company
obligation.amount = number
obligation.currency = text
obligation.expires = date
obligation.renews = bool
event.name = text
event.recurs = bool
event.location = ref ; required ; entities=place
event.url = text
event.duration = text

[weak]
about
mentions
