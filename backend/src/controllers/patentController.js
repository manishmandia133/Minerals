import pool from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getAllPatents = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      external_id,
      source,
      title,
      abstract,
      full_text,
      publication_number,
      publication_date,
      filing_date,
      applicants,
      inventors,
      organisation,
      mineral,
      technology_area,
      status,
      source_url,
      created_at
    FROM patents
    ORDER BY created_at DESC, id DESC
  `);

  res
    .status(200)
    .json(new ApiResponse(200, result.rows, 'Patents fetched successfully'));
});

const getPatentsByMineral = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      external_id,
      source,
      title,
      abstract,
      full_text,
      publication_number,
      publication_date,
      filing_date,
      applicants,
      inventors,
      organisation,
      mineral,
      technology_area,
      status,
      source_url,
      created_at
    FROM patents
    WHERE mineral ILIKE $1
    ORDER BY created_at DESC, id DESC
  `, [req.params.mineral]);

  res
    .status(200)
    .json(new ApiResponse(200, result.rows, 'Patents filtered by mineral successfully'));
});

const getPatentsByYear = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      external_id,
      source,
      title,
      abstract,
      full_text,
      publication_number,
      publication_date,
      filing_date,
      applicants,
      inventors,
      organisation,
      mineral,
      technology_area,
      status,
      source_url,
      created_at
    FROM patents
    WHERE EXTRACT(YEAR FROM publication_date) = $1
    ORDER BY created_at DESC, id DESC
  `, [req.params.year]);

  res
    .status(200)
    .json(new ApiResponse(200, result.rows, 'Patents filtered by year successfully'));
});

export { getAllPatents, getPatentsByMineral, getPatentsByYear };