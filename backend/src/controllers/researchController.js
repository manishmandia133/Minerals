import pool from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getAllResearches = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      title,
      document_type,
      abstract,
      organisation,
      researchers,
      mineral,
      technology_area,
      source,
      publication_year,
      source_url,
      created_at
    FROM research_documents
    ORDER BY created_at DESC, id DESC
  `);

  res
    .status(200)
    .json(new ApiResponse(200, result.rows, 'Research documents fetched successfully'));
});

const getResearchesByMineral = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      title,
      document_type,
      abstract,
      organisation,
      researchers,
      mineral,
      technology_area,
      source,
      publication_year,
      source_url,
      created_at
    FROM research_documents
    WHERE mineral ILIKE $1
    ORDER BY created_at DESC, id DESC
  `, [req.params.mineral]);

  res
    .status(200)
    .json(new ApiResponse(200, result.rows, 'Research documents filtered by mineral successfully'));
});

const getResearchesByYear = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      title,
      document_type,
      abstract,
      organisation,
      researchers,
      mineral,
      technology_area,
      source,
      publication_year,
      source_url,
      created_at
    FROM research_documents
    WHERE publication_year = $1
    ORDER BY created_at DESC, id DESC
  `, [req.params.year]);

  res
    .status(200)
    .json(new ApiResponse(200, result.rows, 'Research documents filtered by year successfully'));
});

export {
  getAllResearches,
  getResearchesByMineral,
  getResearchesByYear,
};