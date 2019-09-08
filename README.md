# dnm

[![Greenkeeper badge](https://badges.greenkeeper.io/taoyuan/dnm.svg)](https://greenkeeper.io/)

> Manipulate DNS records on various DNS providers(only `gandi` for now) in a standardized/agnostic way for nodejs.

## Installation

```bash
npm i dnm -g
```

## Usage

### dnm

```bash
> dnm -h

   dnm 0.1.0

   USAGE

     dnm gandi <action> <domain>

     Manage DNS records that hosted in gandi

   ARGUMENTS

     <action>      Specify the action to take                           required
     <domain>      Specify the domain, supports subdomains as well      required

   OPTIONS

     -n, --name          Specify the record name                                 optional
     -t, --type          Specify the entry type                                  optional
     -d, --content       Specify the record content                              optional
     -l, --ttl           Specify the record time-to-live                         optional
     -i, --priority      Specify the record priority                             optional
     -o, --output        Specify the output format in table,transposed,json      optional
     -T, --token         Specify the gandi api key to authenticate               optional

   GLOBAL OPTIONS

     -h, --help         Display help
     -V, --version      Display version
     --no-color         Disable colors
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages
```

### dnu

```bash
> dnu -h

   dnu 0.1.0 - Dynamic update domain ip records

   USAGE

     dnu [provider] [domains]

   ARGUMENTS

     [provider]      Specify the dns provider                           optional
     [domains]       Specify the domains to perform, could be list      optional

   OPTIONS

     -t, --type        Specify the entry type                           optional      default: "A"
     -l, --ttl         Specify the record time-to-live                  optional      default: 300
     -c, --config      Path to the updyn configuration file             optional
     -U, --user        Specify the auth username for some provider      optional
     -P, --pass        Specify the auth password for some provider      optional
     -T, --token       Specify the auth token for some provider         optional
     -S, --secret      Specify the auth secret for some provider        optional

   GLOBAL OPTIONS

     -h, --help         Display help
     -V, --version      Display version
     --no-color         Disable colors
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages
```



## Reference

* [lexicon](https://github.com/AnalogJ/lexicon): Manipulate DNS records on various DNS providers in a standardized way.
* [gandi-dyndns-node](https://github.com/GhyslainBruno/gandi-dyndns-node): Little piece of code in NodeJS to replace dynamically your IP of a Gandi's domain by your actual external IP address (for those who have a dynamic IP and who have some domains at Gandi's company).