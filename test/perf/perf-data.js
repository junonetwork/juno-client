/* eslint-disable quote-props, quotes, comma-dangle */
exports.graphFragment = {
  "json": {
    "resource": {
      "$__path": [
        "resource"
      ],
      "schema:Person": {
        "$__path": [
          "resource",
          "schema:Person"
        ],
        "skos:prefLabel": {
          "lang": "en",
          "type": "xsd:string",
          "$type": "atom",
          "value": "Person",
          "$size": 56
        }
      },
      "schema:name": {
        "$__path": [
          "resource",
          "schema:name"
        ],
        "skos:prefLabel": {
          "lang": "en",
          "type": "xsd:string",
          "$type": "atom",
          "value": "Name",
          "$size": 54
        }
      },
      "schema:birthPlace": {
        "$__path": [
          "resource",
          "schema:birthPlace"
        ],
        "skos:prefLabel": {
          "lang": "en",
          "type": "xsd:string",
          "$type": "atom",
          "value": "Birth Place",
          "$size": 61
        }
      },
      "schema:birthDate": {
        "$__path": [
          "resource",
          "schema:birthDate"
        ],
        "skos:prefLabel": {
          "lang": "en",
          "type": "xsd:string",
          "$type": "atom",
          "value": "Birth Date",
          "$size": 60
        }
      },
      "schema:sibling": {
        "$__path": [
          "resource",
          "schema:sibling"
        ],
        "skos:prefLabel": {
          "lang": "en",
          "type": "xsd:string",
          "$type": "atom",
          "value": "Siblings",
          "$size": 58
        }
      }
    },
    "collection": {
      "$__path": [
        "collection"
      ],
      "schema:Person": {
        "0": {
          "$__path": [
            "resource",
            "data:james"
          ],
          "schema:name": {
            "0": {
              "lang": "en",
              "type": "xsd:string",
              "$type": "atom",
              "value": "JLC",
              "$size": 53
            },
            "$__path": [
              "resource",
              "data:james",
              "schema:name"
            ],
            "length": {
              "$type": "atom",
              "value": 4,
              "$size": 51
            }
          },
          "schema:birthPlace": {
            "0": {
              "$__path": [
                "resource",
                "http://www.wikidata.org/wiki/Q60"
              ],
              "skos:prefLabel": {
                "type": "xsd:string",
                "$type": "atom",
                "value": "Portland, ME",
                "$size": 62
              },
              "uri": {
                "$type": "atom",
                "value": "http://www.wikidata.org/wiki/Q60",
                "$size": 82
              }
            },
            "$__path": [
              "resource",
              "data:james",
              "schema:birthPlace"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:birthDate": {
            "0": {
              "type": "xsd:date",
              "$type": "atom",
              "value": "1988-05-02",
              "$size": 60
            },
            "$__path": [
              "resource",
              "data:james",
              "schema:birthDate"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:sibling": {
            "0": {
              "$__path": [
                "resource",
                "data:micah"
              ],
              "skos:prefLabel": {
                "lang": "en",
                "type": "xsd:string",
                "$type": "atom",
                "value": "Micah Conkling",
                "$size": 64
              },
              "uri": {
                "$type": "atom",
                "value": "data:micah",
                "$size": 60
              }
            },
            "$__path": [
              "resource",
              "data:james",
              "schema:sibling"
            ],
            "length": {
              "$type": "atom",
              "value": 4,
              "$size": 51
            }
          }
        },
        "1": {
          "$__path": [
            "resource",
            "data:micah"
          ],
          "schema:name": {
            "0": {
              "lang": "en",
              "type": "xsd:string",
              "$type": "atom",
              "value": "Mitzan",
              "$size": 56
            },
            "$__path": [
              "resource",
              "data:micah",
              "schema:name"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:birthPlace": {
            "0": {
              "$__path": [
                "resource",
                "http://www.wikidata.org/wiki/Q60"
              ],
              "skos:prefLabel": {
                "type": "xsd:string",
                "$type": "atom",
                "value": "Portland, ME",
                "$size": 62
              },
              "uri": {
                "$type": "atom",
                "value": "http://www.wikidata.org/wiki/Q60",
                "$size": 82
              }
            },
            "$__path": [
              "resource",
              "data:micah",
              "schema:birthPlace"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:birthDate": {
            "0": {
              "type": "xsd:date",
              "$type": "atom",
              "value": "1988-05-02",
              "$size": 60
            },
            "$__path": [
              "resource",
              "data:micah",
              "schema:birthDate"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:sibling": {
            "0": {
              "$__path": [
                "resource",
                "data:james"
              ],
              "skos:prefLabel": {
                "lang": "en",
                "type": "xsd:string",
                "$type": "atom",
                "value": "James Conkling",
                "$size": 64
              },
              "uri": {
                "$type": "atom",
                "value": "data:james",
                "$size": 60
              }
            },
            "$__path": [
              "resource",
              "data:micah",
              "schema:sibling"
            ],
            "length": {
              "$type": "atom",
              "value": 4,
              "$size": 51
            }
          }
        },
        "2": {
          "$__path": [
            "resource",
            "data:parker"
          ],
          "schema:name": {
            "0": {
              "lang": "en",
              "type": "xsd:string",
              "$type": "atom",
              "value": "Parker",
              "$size": 56
            },
            "$__path": [
              "resource",
              "data:parker",
              "schema:name"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:birthPlace": {
            "0": {
              "$__path": [
                "resource",
                "http://www.wikidata.org/wiki/Q60"
              ],
              "skos:prefLabel": {
                "type": "xsd:string",
                "$type": "atom",
                "value": "Portland, ME",
                "$size": 62
              },
              "uri": {
                "$type": "atom",
                "value": "http://www.wikidata.org/wiki/Q60",
                "$size": 82
              }
            },
            "$__path": [
              "resource",
              "data:parker",
              "schema:birthPlace"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:birthDate": {
            "0": {
              "type": "xsd:date",
              "$type": "atom",
              "value": "1987-10-07",
              "$size": 60
            },
            "$__path": [
              "resource",
              "data:parker",
              "schema:birthDate"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:sibling": {
            "0": {
              "$__path": [
                "resource",
                "data:james"
              ],
              "skos:prefLabel": {
                "lang": "en",
                "type": "xsd:string",
                "$type": "atom",
                "value": "James Conkling",
                "$size": 64
              },
              "uri": {
                "$type": "atom",
                "value": "data:james",
                "$size": 60
              }
            },
            "$__path": [
              "resource",
              "data:parker",
              "schema:sibling"
            ],
            "length": {
              "$type": "atom",
              "value": 4,
              "$size": 51
            }
          }
        },
        "3": {
          "$__path": [
            "resource",
            "data:sam"
          ],
          "schema:name": {
            "0": {
              "lang": "en",
              "type": "xsd:string",
              "$type": "atom",
              "value": "Samuel",
              "$size": 56
            },
            "$__path": [
              "resource",
              "data:sam",
              "schema:name"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:birthPlace": {
            "0": {
              "$__path": [
                "resource",
                "http://www.wikidata.org/wiki/Q60"
              ],
              "skos:prefLabel": {
                "type": "xsd:string",
                "$type": "atom",
                "value": "Portland, ME",
                "$size": 62
              },
              "uri": {
                "$type": "atom",
                "value": "http://www.wikidata.org/wiki/Q60",
                "$size": 82
              }
            },
            "$__path": [
              "resource",
              "data:sam",
              "schema:birthPlace"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:birthDate": {
            "0": {
              "type": "xsd:date",
              "$type": "atom",
              "value": "1984-01-22",
              "$size": 60
            },
            "$__path": [
              "resource",
              "data:sam",
              "schema:birthDate"
            ],
            "length": {
              "$type": "atom",
              "value": 1,
              "$size": 51
            }
          },
          "schema:sibling": {
            "0": {
              "$__path": [
                "resource",
                "data:james"
              ],
              "skos:prefLabel": {
                "lang": "en",
                "type": "xsd:string",
                "$type": "atom",
                "value": "James Conkling",
                "$size": 64
              },
              "uri": {
                "$type": "atom",
                "value": "data:james",
                "$size": 60
              }
            },
            "$__path": [
              "resource",
              "data:sam",
              "schema:sibling"
            ],
            "length": {
              "$type": "atom",
              "value": 4,
              "$size": 51
            }
          }
        },
        "$__path": [
          "collection",
          "schema:Person"
        ],
        "length": {
          "$type": "atom",
          "value": 5,
          "$size": 51
        }
      }
    }
  }
};
