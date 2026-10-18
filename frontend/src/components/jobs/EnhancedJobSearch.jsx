import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  VStack,
  HStack,
  Button,
  Text,
  Tag,
  TagCloseButton,
  TagLabel,
  useDisclosure,
  Collapse,
  Checkbox,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiX, FiMapPin, FiDollarSign } from 'react-icons/fi';
import SearchService from '../../services/searchService';

const EnhancedJobSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [minSalary, setMinSalary] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();

  // Debounced skill suggestion fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (skillInput.trim().length > 2) {
        fetchSkillSuggestions(skillInput);
      } else {
        setSkillSuggestions([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [skillInput]);

  const fetchSkillSuggestions = async (input) => {
    try {
      const response = await SearchService.suggestSkills(input);
      if (response.success) {
        setSkillSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching skill suggestions:', error);
    }
  };

  const addSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
      setSkillSuggestions([]);
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSearch = () => {
    const filters = {};
    
    if (skills.length > 0) {
      filters.skills = skills;
    }
    
    if (location) {
      filters.location = location;
    }
    
    if (isRemote) {
      filters.is_remote = true;
    }
    
    if (minSalary) {
      filters.salary_min = minSalary;
    }
    
    onSearch(query, filters);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setQuery('');
    setSkills([]);
    setLocation('');
    setIsRemote(false);
    setMinSalary('');
    onSearch('', {});
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding={4}
      backgroundColor="white"
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <HStack spacing={2}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search jobs by title, company, or skills..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              borderRadius="md"
            />
          </InputGroup>
          <Button
            colorScheme="blue"
            onClick={handleSearch}
            leftIcon={<FiSearch />}
            borderRadius="md"
          >
            Search
          </Button>
        </HStack>

        {/* Skills Tags */}
        {skills.length > 0 && (
          <HStack spacing={2} wrap="wrap">
            {skills.map(skill => (
              <Tag key={skill} size="md" borderRadius="full">
                <TagLabel>{skill}</TagLabel>
                <TagCloseButton onClick={() => removeSkill(skill)} />
              </Tag>
            ))}
          </HStack>
        )}

        {/* Advanced Filters */}
        <Collapse in={isOpen} animateOpacity>
          <VStack spacing={4} align="stretch" pt={4} borderTopWidth="1px">
            {/* Skills Input */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Skills
              </Text>
              <HStack spacing={2}>
                <Input
                  placeholder="Add skills..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && skillInput.trim()) {
                      addSkill(skillInput.trim());
                      e.preventDefault();
                    }
                  }}
                />
                <Button
                  onClick={() => skillInput.trim() && addSkill(skillInput.trim())}
                  colorScheme="blue"
                >
                  Add
                </Button>
              </HStack>
              {/* Skill Suggestions */}
              {skillSuggestions.length > 0 && (
                <HStack spacing={2} mt={2} wrap="wrap">
                  {skillSuggestions.map(suggestion => (
                    <Tag
                      key={suggestion}
                      size="sm"
                      cursor="pointer"
                      onClick={() => addSkill(suggestion)}
                      _hover={{ bg: 'gray.100' }}
                    >
                      <TagLabel>{suggestion}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              )}
            </Box>

            {/* Location */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Location
              </Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiMapPin} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="City, State, or Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </InputGroup>
            </Box>

            {/* Remote Work */}
            <Checkbox
              isChecked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
            >
              Remote jobs only
            </Checkbox>

            {/* Minimum Salary */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Minimum Salary
              </Text>
              <NumberInput
                value={minSalary}
                onChange={(value) => setMinSalary(value)}
                min={0}
                precision={0}
              >
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiDollarSign} color="gray.400" />
                  </InputLeftElement>
                  <NumberInputField placeholder="Minimum salary" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </InputGroup>
              </NumberInput>
            </Box>
          </VStack>
        </Collapse>

        <HStack justifyContent="space-between">
          <Button
            leftIcon={<FiFilter />}
            variant="outline"
            onClick={onToggle}
            size="sm"
          >
            {isOpen ? 'Hide Filters' : 'Advanced Filters'}
          </Button>
          {(query || skills.length > 0 || location || isRemote || minSalary) && (
            <Button
              leftIcon={<FiX />}
              variant="ghost"
              colorScheme="red"
              onClick={clearFilters}
              size="sm"
            >
              Clear All
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default EnhancedJobSearch;