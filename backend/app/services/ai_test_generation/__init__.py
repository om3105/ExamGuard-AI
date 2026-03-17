"""
ai_test_generation — Rule-based exam generation service.

Provides a template-driven exam generator that parses admin prompts
and assembles structured exams from curated question banks.
No paid APIs, no local LLM dependency — fully cloud-deployable.

Architecture uses a Strategy pattern so a hosted LLM can be swapped
in later without changing any other code.
"""
