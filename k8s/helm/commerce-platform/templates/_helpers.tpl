{{/*
Expand the name of the chart.
*/}}
{{- define "commerce.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "commerce.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart label value.
*/}}
{{- define "commerce.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels applied to all resources.
*/}}
{{- define "commerce.labels" -}}
helm.sh/chart: {{ include "commerce.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Selector labels for a given component name.
Usage: {{ include "commerce.selectorLabels" (dict "name" "product-service" "Release" .Release) }}
*/}}
{{- define "commerce.selectorLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Image reference for a given service config.
Usage: {{ include "commerce.image" (dict "svc" .svc "global" .Values.global) }}
*/}}
{{- define "commerce.image" -}}
{{ .global.imageRegistry }}/{{ .global.imageRepository }}/{{ .svc.image }}:{{ .svc.tag | default "latest" }}
{{- end }}
