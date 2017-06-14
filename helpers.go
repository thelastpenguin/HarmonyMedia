package main

import (
  "encoding/json"
)

// JSONStringify takes an object and serializes it. Returns {} on error.
func JSONStringify(obj interface{}) string {
  if ret, err := json.Marshal(obj); err == nil {
    return string(ret)
  }
  return "{}"
}

// StatusMessage is a convenience class allowing for encoding and decoding status messages
type StatusMessage struct {
  Status string `json:"status"`
  Message string `json:"message"`
}
