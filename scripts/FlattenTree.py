import json, sys, argparse

Keys = {
	'id': 'id',
	'pid': 'parent',
	'label': 'text',
	'url': 'url',
	'items': 'items'
	}

def ParseArgs():
	parser = argparse.ArgumentParser(
	formatter_class=argparse.RawTextHelpFormatter,
		description='Flatten a tree constructed from JSON object.',
		epilog=
			'Important Note: Currently the tree has to have a certain formate:\n'+
			'<tree> (As JSObject) := id: <node>\n'+
			'<node> (As JSObject) := KeyValues [, "childKey": <tree>]\n'+
			'\n'+
			'example:\n'+
			'{\n'+
			'  "Root1": {\n'+
			'    "label": "Root Node 1",\n'+
			'    "child": {\n'+
			'      "Child1": {\n'+
			'        "label": "Child Node 1"\n'+
			'      },\n'+
			'      "Child2": {\n'+
			'        "label": "Child Node 2"\n'+
			'      }\n'+
			'    }\n'+
			'  },\n'+
			'  "Root2":{\n'+
			'    "label": "Root Node 2"\n'+
			'  }\n'+
			'}\n'+
			'\n\n'+
			'Note 2: There is a hard coded translator that only works for a specific tree nodeIDs. I should generalize it soon.\n'
		)
	parser.add_argument(
		nargs='?',
		type=argparse.FileType('r'),
		dest='iFile',
		default=sys.stdin,
		help='Input json file path. (default: stdin)',
		metavar='iFPath'
		)
	parser.add_argument(
		'-o',
		type=argparse.FileType('w'),
		dest='oFile',
		default=sys.stdout,
		help='Output json file path. (default: stdout)',
		metavar='oFPath'
		)
	parser.add_argument(
		'-l',
		type=int,
		dest='level',
		default=0,
		help='Flatten Level: Level at which all nodes. (default: 0)',
		metavar='level'
		)
	parser.add_argument(
		'-r',
		type=str,
		dest='rootID',
		default=None,
		help='Flattened Root ID: The ID of the root for the flattened part. (default: pid (for Flatten Level > 1) or "." (Flatten Level = 0))',
		metavar='rootID'
		)
	parser.add_argument(
		'-c',
		type=str,
		dest='childKey',
		default='child',
		help='Child Key: Key of object to be considered as the sub tree. (default: "child")',
		metavar='childKey'
		)
	return parser.parse_args()
args = ParseArgs()
if args.level < 0:
	print("Flatten level less than 1 is not supported!")
	sys.exit()

def flatten(items_old, level, rootid):
	def _flatten(pid, items_old):
		items = {}
		for id, item_old in items_old.items():
			item = {Keys[key_old]: value for key_old, value in item_old.items() if key_old != args.childKey}
			item[Keys['id']] = id
			item[Keys['pid']] = pid
			if args.childKey in item_old:
				items.update(_flatten(id, item_old[args.childKey]))
			items[id] = item
		return items

	if(level == 0):
		return _flatten(rootid or '.', items_old)
	items = {}
	for id, item_old in items_old.items():
		item = {Keys[key_old]: value for key_old, value in item_old.items() if key_old != args.childKey}
		items[id] = item
		if args.childKey in item_old:
			item[Keys[args.childKey]] = flatten(item_old[args.childKey], level-1, rootid or id)

	return items

items = flatten(json.load(args.iFile), rootid=args.rootID, level=args.level)
json.dump(items, args.oFile, indent='\t', sort_keys=True)
