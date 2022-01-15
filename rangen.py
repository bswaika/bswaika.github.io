from sys import argv
from random import choice

chars = 'abcdefghijklmnopqrstuwxyz0123456789'
length = int(argv[1])

result = ''
for i in range(length):
    result += choice(chars)

print(result)
