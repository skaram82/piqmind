---
publishDate: 2026-03-19T00:00:00Z
author: Pavlos Sermpezis
title: ChatIYP
excerpt: AI-powered assistant for the Internet Yellow Pages (IYP) knowledge database
image: https://exanta.io/_astro/hero_shape_chatiyp.Ki8nA4K6_2eq7qq.webp
category: tools
tags:
  - chatiyp
metadata:
  canonical: https://piqmind.com/tools/chatiyp
---

The [IYP](https://iyp.iijlab.net/) by IIJ is a publicly available knowledge database that integrates various datasets of Internet resources (ASNs, IP prefixes, domain names, RKPI, etc.). However, to query IYP one needs to know the Cypher Neo4j graph query language and the database complex schema.

For example the query for:
_"Domain name that resolve to an IP originated by ASxxx"_

in Cypher language in the IYP database would be:

_MATCH (as:AS{asn:xxx})-[:ORIGINATE] -> (p:Prefix) <- [:PART_OF]-(ip:IP) <- [:RESOLVES_TO] - (hn:HostName)-[:PART_OF] -> (dn:DomainName) RETURN dn.name_

ChatIYP, developed in collaboration with [exanta](https://exanta.io/) and [Datalab](https://datalab.csd.auth.gr/), is an intelligent chatbot designed to help users navigate the IYP knowledge database with ease. Whether you're searching for ASN details, prefix origins, or IXP country presence, or other information from IYP datasets, ChatIYP delivers precise answers in natural language and provides the corresponding query for deeper database exploration.

<a href="https://chatiyp.csd.auth.gr/" target="_blank" class="btn-primary mt-4">
  <span class="text-white text-center">Check the tool</span>
</a>
