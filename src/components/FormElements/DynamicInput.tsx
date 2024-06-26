import { ReactElement } from 'react'
import {
  TextField,
  RadioGroup,
  Rating,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Radio,
  FormGroup,
  Checkbox,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  TimePicker,
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import datatypes from '@constants/datatypes.json'
import OptionInput from './OptionInput'
import { useFormContext } from '@context/FormContext'

export default function DynamicInput({
  index,
  deactivated = true
}: {
  index: number
  deactivated?: boolean
}): ReactElement {
  const {
    fieldDataTypes,
    setFormResponses,
    formResponses,
    fieldOptions,
    setFieldOptions
  } = useFormContext()
  const typeIndex = fieldDataTypes[index] ? fieldDataTypes[index] : 0
  const type = datatypes[typeIndex]?.type

  const handleFormResponses = (value: string) => {
    const newResponses = [...formResponses]
    newResponses[index] = value
    setFormResponses(newResponses)
  }

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentValues = formResponses[index]
      ? formResponses[index].split(', ')
      : []
    if (checked) {
      if (!currentValues.includes(option)) {
        currentValues.push(option)
      }
    } else {
      const optionIndex = currentValues.indexOf(option)
      if (optionIndex > -1) {
        currentValues.splice(optionIndex, 1)
      }
    }
    handleFormResponses(currentValues.join(', '))
  }

  //  TODO: implement maximumand minimum values for slider
  // const handleFieldOptionsChange = (optionIndex: number, value: string) => {
  //   const updatedOptions = [...fieldOptions[index]]
  //   updatedOptions[optionIndex] = value
  //   const newFieldOptions = [...fieldOptions]
  //   newFieldOptions[index] = updatedOptions
  //   setFieldOptions(newFieldOptions)
  // }

  const renderComponent = () => {
    switch (type) {
      case 'Single line text':
        return (
          <TextField
            label="Single line text"
            variant="standard"
            fullWidth={true}
            disabled={deactivated}
            onChange={(e) => {
              handleFormResponses(e.target.value)
            }}
          />
        )
      case 'Multi line text':
        return (
          <TextField
            label="Multi line text"
            variant="standard"
            fullWidth={true}
            multiline
            rows={3}
            disabled={deactivated}
            onChange={(e) => {
              handleFormResponses(e.target.value)
            }}
          />
        )
      case 'Number':
        return (
          <TextField
            label="Number"
            type="number"
            variant="standard"
            fullWidth={true}
            disabled={deactivated}
            onChange={(e) => {
              handleFormResponses(e.target.value)
            }}
          />
        )
      case 'Checkboxes':
        return deactivated ? (
          <OptionInput inputType="checkbox" index={index} />
        ) : (
          <FormGroup>
            {fieldOptions[index].map((option, i) => (
              <FormControlLabel
                key={i}
                value={option}
                control={
                  <Checkbox
                    onChange={(e) => {
                      handleCheckboxChange(option, e.target.checked)
                    }}
                    checked={formResponses[index]?.split(', ').includes(option)}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        )
      case 'Multiple choice':
        return deactivated ? (
          <OptionInput inputType="radio" index={index} />
        ) : (
          <RadioGroup>
            {fieldOptions[index].map((option, i) => (
              <FormControlLabel
                key={i}
                value={option}
                control={
                  <Radio
                    onChange={(e) => {
                      handleFormResponses(e.target.value)
                    }}
                  />
                }
                label={option}
              />
            ))}
          </RadioGroup>
        )
      case 'Drop-down':
        return deactivated ? (
          <OptionInput inputType="select" index={index} />
        ) : (
          <FormControl fullWidth>
            <InputLabel id="dropdown-select-label">Choose</InputLabel>
            <Select
              label="Choose"
              onChange={(e) => {
                handleFormResponses(e.target.value as string)
              }}
            >
              {fieldOptions[index].map((option, i) => (
                <MenuItem key={i} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case 'Rating':
        return (
          <Rating
            onChange={(e, newValue) => {
              handleFormResponses(newValue.toString())
            }}
          />
        )
      case 'Slider':
        return (
          <>
            {/* <TextField
              label="Min value"
              type="number"
              variant="standard"
              onChange={(e) => {
                handleFieldOptionsChange(0, e.target.value)
              }}
              sx={{ marginRight: '25px' }}
            />
            <TextField
              label="Max value"
              type="number"
              variant="standard"
              onChange={(e) => {
                handleFieldOptionsChange(1, e.target.value)
              }}
            /> */}
            <Slider
              defaultValue={30}
              min={
                0
                // Number(fieldOptions[index][0]) >= 0
                //   ? Number(fieldOptions[index][0])
                //   : 0
              }
              max={
                100
                // Number(fieldOptions[index][1]) >= 0
                //   ? Number(fieldOptions[index][1])
                //   : 100
              }
              valueLabelDisplay="on"
              onChange={(e, newValue) => {
                handleFormResponses(newValue.toString())
              }}
            />
          </>
        )
      case 'Switch':
        return deactivated ? (
          <OptionInput inputType="switch" index={index} />
        ) : (
          <FormControlLabel
            control={
              <Switch
                onChange={(e) => {
                  handleFormResponses(e.target.checked.toString())
                }}
              />
            }
            label={fieldOptions[index][0]}
          />
        )
      case 'time':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              readOnly={deactivated}
              onChange={(newValue) => handleFormResponses(newValue.toString())}
            />
          </LocalizationProvider>
        )
      case 'Date':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              readOnly={deactivated}
              onChange={(newValue) => handleFormResponses(newValue.toString())}
            />
          </LocalizationProvider>
        )
      case 'Date range':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateRangePicker
              readOnly={deactivated}
              onChange={(newValue) => handleFormResponses(newValue.toString())}
            />
          </LocalizationProvider>
        )
      default:
        return <div>Component type not recognized.</div>
    }
  }

  return <>{renderComponent()}</>
}
