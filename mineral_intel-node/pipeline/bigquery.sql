-- Task 2 (source 3): Indian-origin patents from Google Patents Public Data.
-- Run this in Kaggle (free BigQuery integration) or via bigquery-export.mjs.
-- Export the result as data/raw/gpatents_in.csv
SELECT
  publication_number AS id,
  (SELECT v.text FROM UNNEST(title_localized) v LIMIT 1) AS title,
  (SELECT v.text FROM UNNEST(abstract_localized) v LIMIT 1) AS abstract,
  (SELECT STRING_AGG(name, '; ') FROM UNNEST(assignee_harmonized)) AS assignee,
  (SELECT STRING_AGG(name, '; ') FROM UNNEST(inventor_harmonized)) AS inventor,
  DATE(filing_date) AS filing_date,
  DATE(grant_date) AS grant_date,
  (SELECT STRING_AGG(code, '; ') FROM UNNEST(ipc)) AS ipc_cpc_codes
FROM `patents-public-data.patents.publications`
WHERE country_code = 'IN'
