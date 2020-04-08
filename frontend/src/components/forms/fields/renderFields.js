import React from 'react';
import Text from './text';
import Image from './image';
import Select from './select';
import Check from './check';
import DateTime from './date_picker';
import Option from './2letters_option';



  export const renderTextField = ({
    input,
    placeholder,
    label,
    meta: { touched, error }
    }) => (
      <Text
      placeholder={placeholder}
      label={label}
      errorText={touched && error}
      error={touched && error}
      {...input}
      />
    )

  export const renderImageField = ({
    input,
    placeholder,
    meta: { touched, error }
    }) => (
        <Image
            placeholder={placeholder}
            errorText={touched && error}
            error={touched && error}
            {...input}
        />
    )

  export const renderCheckField = ({
    input,
    label,
    meta: { touched, error }
    }) => (
          <Check
              label={label}
              errorText={touched && error}
              error={touched && error}
              {...input}
          />
    )

    export const renderSelectField = ({
    input,
    placeholder,
    label,
    meta: { touched, error },
    children,
    id
    }) => (
          <Select
              placeholder={placeholder}
              label={label}
              id={id}
              errorText={touched && error}
              error={touched && error}
              {...input}
          >
              {children}
          </Select>
    )

    export const renderDateTimeField = ({
      input,
      placeholder,
      label,
      meta: { touched, error },
      }) => (
  
          <DateTime
              placeholder={placeholder}
              label={label}
              errorText={touched && error}
              error={touched && error}
  
              {...input}
          />
      )

      
    export const render2letterOption = ({
      input,
      placeholder,
      label,
      meta: { touched, error },
      }) => (
  
          <Option
              placeholder={placeholder}
              label={label}
              errorText={touched && error}
              error={touched && error}
  
              {...input}
          />
      )

