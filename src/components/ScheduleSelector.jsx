import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import scheduleData from '../data/horarios.json';

const ScheduleSelector = ({ onGroupSelect, selectedGroups }) => {
  const [openSemesters, setOpenSemesters] = useState({});
  const [openSubjects, setOpenSubjects] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSemester = (semester) => {
    setOpenSemesters(prev => ({
      ...prev,
      [semester]: !prev[semester]
    }));
  };

  const toggleSubject = (subject) => {
    setOpenSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  const filteredScheduleData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return scheduleData;

    const filtered = {};

    if (!scheduleData || typeof scheduleData !== 'object') {
      console.error('Schedule data is not properly loaded:', scheduleData);
      return {};
    }

    Object.entries(scheduleData).forEach(([semester, subjects]) => {
      const filteredSubjects = {};

      Object.entries(subjects).forEach(([subject, groups]) => {
        const filteredGroups = {};

        Object.entries(groups).forEach(([groupNum, groupData]) => {
          const matchesGroup = groupNum.toLowerCase().includes(query);
          const matchesProfessor = groupData?.profesor?.nombre?.toLowerCase()?.includes(query) || false;
          const matchesAyudante = groupData?.ayudantes?.some(
            ayudante => ayudante?.nombre?.toLowerCase()?.includes(query)
          ) || false;
          const matchesSubject = subject.toLowerCase().includes(query);
          const matchesSemester = semester.toLowerCase().includes(query);

          if (matchesGroup || matchesProfessor || matchesAyudante || matchesSubject || matchesSemester) {
            filteredGroups[groupNum] = groupData;
          }
        });

        if (Object.keys(filteredGroups).length > 0) {
          filteredSubjects[subject] = filteredGroups;
        }
      });

      if (Object.keys(filteredSubjects).length > 0) {
        filtered[semester] = filteredSubjects;
      }
    });

    return filtered;
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingSemesters = {};
      const matchingSubjects = {};

      Object.keys(filteredScheduleData).forEach(semester => {
        matchingSemesters[semester] = true;
        Object.keys(filteredScheduleData[semester] || {}).forEach(subject => {
          matchingSubjects[subject] = true;
        });
      });

      setOpenSemesters(matchingSemesters);
      setOpenSubjects(matchingSubjects);
    } else {
      setOpenSemesters({});
      setOpenSubjects({});
    }
  }, [searchQuery, filteredScheduleData]);

  const renderGroupCard = (group, groupData, semester, subject) => (
    <div
      key={group}
      className={`bg-gray-800 p-2 rounded mb-2 text-sm border cursor-pointer ${selectedGroups.some(g =>
        g.semester === semester &&
        g.subject === subject &&
        g.group === group
      ) ? 'border-blue-500' : 'border-gray-700'
        }`}
      onClick={() => onGroupSelect(semester, subject, group, groupData)}
    >
      <h4 className="font-bold text-gray-100 mb-1">Grupo {group}</h4>
      <div className="space-y-2">
        <div>
          <p className="text-gray-200 text-sm">{groupData?.profesor?.nombre}</p>
          <p className="text-gray-400 text-xs">
            {groupData?.profesor?.horario} ({groupData?.profesor?.dias?.join(", ")})
          </p>
        </div>
        {groupData?.ayudantes && groupData.ayudantes.length > 0 && (
          <div className="border-t border-gray-700 pt-1 mt-1">
            <p className="text-gray-300 text-xs font-medium">Ayudantes:</p>
            {groupData.ayudantes.map((ayudante, index) => (
              <div key={index} className="ml-1">
                <p className="text-gray-200 text-sm">{ayudante?.nombre}</p>
                <p className="text-gray-400 text-xs">
                  {ayudante?.horario} ({ayudante?.dias?.join(", ")})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-gray-100 mb-4">Horarios por Semestre</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-8 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          />
          <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
        </div>
        {searchQuery && Object.keys(filteredScheduleData).length === 0 && (
          <p className="mt-2 text-sm text-gray-400">No se encontraron resultados</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {Object.entries(filteredScheduleData || {}).map(([semester, subjects]) => (
            <div key={semester} className="mb-3 border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSemester(semester)}
                className="w-full p-2 bg-gray-800 hover:bg-gray-700 flex items-center justify-between text-gray-100 text-sm"
              >
                <span className="font-semibold text-left">{semester}</span>
                {openSemesters[semester] ?
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> :
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                }
              </button>

              {openSemesters[semester] && (
                <div className="p-2 space-y-2">
                  {Object.entries(subjects).map(([subject, groups]) => (
                    <div key={subject} className="border border-gray-700 rounded-lg">
                      <button
                        onClick={() => toggleSubject(subject)}
                        className="w-full p-2 bg-gray-800 hover:bg-gray-700 flex items-center justify-between text-gray-100 text-sm"
                      >
                        <span className="font-medium text-left pr-2">{subject}</span>
                        {openSubjects[subject] ?
                          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> :
                          <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                        }
                      </button>

                      {openSubjects[subject] && (
                        <div className="p-2 bg-gray-900">
                          {Object.entries(groups).map(([group, groupData]) =>
                            renderGroupCard(group, groupData, semester, subject)
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleSelector;