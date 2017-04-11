import json, sys, argparse

def ParseArgs():
	parser = argparse.ArgumentParser(
		formatter_class=argparse.RawTextHelpFormatter,
		description='Print a JSONFile in readable Formate.'
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
		'-s',
		action='store_true',
		dest='sort',
		help='Sort keys or not.'
		)
	parser.add_argument(
		'-m',
		action='store_true',
		dest='min',
		help='Minify by remove all white space'
		)
	return parser.parse_args()

args = ParseArgs()

data = json.load(args.iFile)
if(args.min):
	json.dump(data, args.oFile, sort_keys=args.sort, indent=None, separators=(',', ':'))
else:
	json.dump(data, args.oFile, sort_keys=args.sort, indent='\t')
