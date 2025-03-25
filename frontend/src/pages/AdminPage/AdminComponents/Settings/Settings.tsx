import { FC, useEffect, useState } from "react";
import styles from './Settings.module.css';
import RegularButton from "../../../../components/UI/Buttons/RegularButton";
import RuleService from "../../../../servises/RuleService";
import { IAdditionalOptions } from "../../../../models/ILevarage";
import { Button, Slider, Stack } from "@mui/material";

const Settings: FC = () => {
  const [leverage, setLeverage] = useState(0);
  const [key, setKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [secondOptions, setSecondOptions] = useState(['3d', '1d']);
  const [thirdOptions, setThirdOptions] = useState(['4h']);
  const [formData, setFormData] = useState<IAdditionalOptions>({
    first: '7d',
    second: '3d',
    third: '4h'
  })

  const [validationError, setValidationError] = useState('');

  const fetchLevarages = async () => {
    try {
      const settingsResponse = (await RuleService.getOptions()).data;
      setLeverage(settingsResponse.selected_lev);
      setKey(settingsResponse.apikey);
      setSecretKey(settingsResponse.secret);
  
      const additionalOptionsResponse: IAdditionalOptions = (await RuleService.getAdditionalOptions()).data[0];
      setFormData(additionalOptionsResponse);
      
      switch (additionalOptionsResponse.first) {
        case '7d':
          setSecondOptions(['3d', '1d']);
          setThirdOptions(['4h']);
          break;
        case '3d':
          setSecondOptions(['1d', '4h']);
          if (additionalOptionsResponse.second === '1d') {
            setThirdOptions(['4h', '1h']);
          } else {
            setThirdOptions(['1h']);
          }
          break;
        case '1d':
          setSecondOptions(['4h']);
          setThirdOptions(['1h', '15m']);
          break;
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLevarages();
  }, []);

  const handleSave = async () => {
    if (key.trim() === "" || secretKey.trim() === "") {
      // Display an error message or perform validation as needed
      setValidationError("Ключ и секретный ключ не должны быть пустыми");
    } else {
      try {
        await RuleService.updateOption(key, secretKey, leverage);
        setIsEditing(false);
      } catch(e: any){
        console.error(e);
      }
    }
  };

  const handleAdditionalOptionsUpdate = async () => {
    try {
      await RuleService.saveAdditionalOptions(formData);
    } catch(e: any){
      console.error(e);
    }
  };

  const handleFirstOptionChange = (value: string) => {    
    switch(value) {
      case '7d':
        setSecondOptions(['3d', '1d']);
        setThirdOptions(['4h']);
        setFormData((prev) => ({
          ...prev,
          first: value,
          second: '3d',
          third: '4h'
        }));
        break;
      case '3d':
        setSecondOptions(['1d', '4h']);
        setThirdOptions(['4h', '1h']);
        setFormData((prev) => ({
          ...prev,
          first: value,
          second: '1d',
          third: '4h'
        }));
        break;
      case '1d':
        setSecondOptions(['4h']);
        setThirdOptions(['1h', '15m']);
        setFormData((prev) => ({
          ...prev,
          first: value,
          second: '4h',
          third: '1h'
        }));
    }
  };

  const handleSecondOptionChange = (value: string) => {
    if (formData.first === '3d') {
      if (value === '4h') {
        setThirdOptions(['1h']);
      } else {
        setThirdOptions(['4h', '1h'])
      }
      setFormData((prev) => ({
        ...prev,
        second: value,
        third: '1h'
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        second: value
      }))
    }
  };

  return (
    <div className={styles.settings}>
      <h1>Настройки</h1>
      {validationError 
      ? (
        <div className={styles.error}>{validationError}</div>
      )
      : null}
      <form className={styles.settingsForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Плечо:</label>
            {isEditing ? (
            // <select
            //     className={styles.select}
            //     value={leverage || ''}
            //     onChange={(e) => setLeverage(e.target.value)}
            // >
            //   <option value='-'>--</option>
            //   {levarages.map((item: ILevarage) => (
            //     <option value={item.name}>{item.name}</option>
            //   ))}
            // </select>
              <>        
              <Stack gap="1rem" >                
              <Stack className={styles.inputWrapper}>
                <input 
                  className={styles.input}
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))} />
                <span className={styles.suffix}>x</span>
              </Stack>
                <Slider 
                  min={1}
                  max={100}
                  value={leverage}
                  step={1}
                  valueLabelDisplay="auto"
                  onChange={(_, value) => setLeverage(value as number)} />
              </Stack>      
              </>
            ) : (
                <span>{leverage}x</span>
            )}

            <label className={styles.label}>Общий риск капитала:</label>
            {isEditing ? (
                <input
                    className={styles.input}
                    type="text"
                    value={"1"}
                    onChange={(e) => setKey(e.target.value)}
                />
            ) : (
                <span className={styles.span}>1%</span>
            )}

            <label className={styles.label}>Ключ:</label>
            {isEditing ? (
                <input
                    className={styles.input}
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                />
            ) : (
                <span className={styles.span}>****************</span>
            )}

            <label className={styles.label}>Секретный ключ:</label>
            {isEditing ? (
                <input
                    className={styles.input}
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                />
            ) : (
                <span className={styles.span}>****************</span>
            )}
        </div>
            
        <div className={styles.buttonGroup}>
          {isEditing ? (
            <RegularButton action={handleSave}>
              Сохранить
            </RegularButton>
            ) : (
            <RegularButton action={() => setIsEditing(true)}>
              Изменить
            </RegularButton>
          )}
        </div>

      </form>

        <h2>Дополнительные Настройки</h2>
      <div className={styles.addSection}>
        <div className={styles.selectContainer}>
          <label className={styles.label}>Первое</label>
          <select
            value={formData.first}
            onChange={(e) => handleFirstOptionChange(e.target.value)}
            >
            <option value={'7d'}>7d</option>
            <option value={'3d'}>3d</option>
            <option value={'1d'}>1d</option>
          </select>
        </div>
        <svg className={styles.svgIcon} viewBox="-0.16 -0.16 16.32 16.32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 6L8 2L10 2L16 8L10 14L8 14L8 10L-1.74845e-07 10L-3.01991e-07 6L8 6Z" fill="#ffffff"></path> </g></svg>
        <div className={styles.selectContainer}>
          <label className={styles.label}>Второе</label>
          <select
            value={formData.second}
            onChange={(e) => handleSecondOptionChange(e.target.value)}>
            {secondOptions.map((val) => (
              <option value={val} key={val}>{val}</option>
            )) }
          </select>
        </div>
        <svg className={styles.svgIcon} viewBox="-0.16 -0.16 16.32 16.32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 6L8 2L10 2L16 8L10 14L8 14L8 10L-1.74845e-07 10L-3.01991e-07 6L8 6Z" fill="#ffffff"></path> </g></svg>
        <div className={styles.selectContainer}>
          <label className={styles.label}>Третье</label>
          <select
          value={formData.third}
          onChange={(e) => setFormData((prev) => ({
            ...prev,
            third: e.target.value
          }))}>
            {thirdOptions.map((val) => (
              <option value={val} key={val}>{val}</option>
            ))}
          </select>
        </div>
      </div>
        <Button variant="contained" color="success" size="small" onClick={handleAdditionalOptionsUpdate}>
          Сохранить
        </Button>
    </div>
  );
};

export default Settings;
